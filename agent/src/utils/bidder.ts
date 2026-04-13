import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { AnchorProvider, Program, BorshCoder, EventParser, Wallet, setProvider } from "@coral-xyz/anchor";
import type { Fent } from "@/target/types/fent";
import idl from "@/target/idl/fent.json";

// ─── Config ──────────────────────────────────────────────────────────────────

const RPC_URL      = process.env.RPC_URL      || "https://api.mainnet-beta.solana.com";
const PROGRAM_ID   = new PublicKey(process.env.FENT_PROGRAM_ID!);
const MIN_APY_BPS  = Number(process.env.MIN_APY_BPS  || 700);   // 7.00%
const POLL_INTERVAL_MS = 15_000;                                 // 15 seconds

// ─── Types (mirror on-chain state) ───────────────────────────────────────────

const connection = new Connection(RPC_URL, "confirmed");
const dummyWallet = new Wallet(Keypair.generate());

const provider = new AnchorProvider(connection, dummyWallet, {
  commitment: "confirmed",
});

setProvider(provider);
  
interface AuctionAccount {
  publicKey: PublicKey;
  market: PublicKey;
  seller: PublicKey;
  ytAmount: bigint;
  reservePrice: bigint;
  highestBid: bigint;
  highestBidder: PublicKey;
  endTs: bigint;
  status: { active?: {} };
}

// ─── Main agent loop ─────────────────────────────────────────────────────────

async function runBidderAgent() {
  const connection = new Connection(RPC_URL, "confirmed");

  // NOTE: In production, wallet is provided by Phantom MCP server.
  // The agent uses send_solana_transaction tool to sign and submit bids.
  // Here we set up a read-only provider for account scanning.
  const program = new Program<Fent>(idl as any);

  console.log(`[FENT Agent] Starting. Min APY threshold: ${MIN_APY_BPS / 100}%`);
  console.log(`[FENT Agent] Polling every ${POLL_INTERVAL_MS / 1000}s`);

  while (true) {
    try {
      await scanAndBid(program, connection);
    } catch (err) {
      console.error("[FENT Agent] Error in scan loop:", err);
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

// ─── Scan all active auctions ─────────────────────────────────────────────────

async function scanAndBid(program: Program<Fent>, connection: Connection) {
  const now = Math.floor(Date.now() / 1000);

  // Fetch all Auction accounts with status == Active
  const auctions = await (program.account as any).auction.all([
    {
      memcmp: {
        offset: 8 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 32 + 1 + 8, // offset to status field
        bytes: "1", // Active = 0 in enum, encoded as single byte
      },
    },
  ]);

  console.log(`[FENT Agent] Found ${auctions.length} active auction(s)`);

  for (const { publicKey, account } of auctions) {
    const endTs = Number(account.endTs);
    if (endTs <= now) {
      console.log(`  Auction ${publicKey.toBase58()} has ended — skipping`);
      continue;
    }

    const timeToMaturitySecs = endTs - now;
    const impliedApyBps = computeImpliedApy(
      Number(account.highestBid),
      Number(account.ytAmount),
      timeToMaturitySecs,
    );

    console.log(
      `  Auction ${publicKey.toBase58().slice(0, 8)}…` +
      ` | YT: ${Number(account.ytAmount) / 1e9} ` +
      ` | Top bid: ${Number(account.highestBid) / 1e9} SOL` +
      ` | Implied APY: ${impliedApyBps / 100}%` +
      ` | Ends in: ${Math.round(timeToMaturitySecs / 60)}m`
    );

    if (impliedApyBps >= MIN_APY_BPS) {
      await executeBid(publicKey, account as any, impliedApyBps);
    }
  }
}

// ─── Execute bid via Phantom MCP ─────────────────────────────────────────────

async function executeBid(
  auctionPubkey: PublicKey,
  auction: AuctionAccount,
  currentApyBps: number,
) {
  // Strategy: bid 5% above current highest bid, but only if our target APY
  // is still profitable after the higher bid.
  const currentBid = Number(auction.highestBid);
  const ourBid = currentBid === 0
    ? Number(auction.reservePrice)        // no bids yet — bid reserve
    : Math.floor(currentBid * 1.05);      // outbid by 5%

  // Re-check APY at our proposed bid
  const endTs = Number(auction.endTs);
  const timeToMaturitySecs = endTs - Math.floor(Date.now() / 1000);
  const ourImpliedApy = computeImpliedApy(ourBid, Number(auction.ytAmount), timeToMaturitySecs);

  if (ourImpliedApy < MIN_APY_BPS) {
    console.log(
      `  [skip] Our bid of ${ourBid / 1e9} SOL would imply ${ourImpliedApy / 100}% APY — below threshold`
    );
    return;
  }

  console.log(`  [BID] Placing bid of ${ourBid / 1e9} SOL on auction ${auctionPubkey.toBase58().slice(0, 8)}…`);
  console.log(`        Implied APY at our bid: ${ourImpliedApy / 100}%`);

  /**
   * In the MCP agent context, this is where the agent calls:
   * 
   *   phantom.send_solana_transaction({
   *     transaction: <serialized placeBid instruction>,
   *     simulate: true,   // preview first
   *   })
   * 
   * The Phantom MCP server handles signing via KMS and broadcasts.
   * 
   * For the hackathon demo, you'd wire this to the actual Anchor instruction:
   * 
   *   await program.methods
   *     .placeBid(new BN(ourBid))
   *     .accounts({ auction: auctionPubkey, bidder: agentWallet, ... })
   *     .rpc();
   */
  console.log(`  [MCP] → send_solana_transaction (placeBid, amount=${ourBid})`);
}

// ─── Yield math ──────────────────────────────────────────────────────────────

/**
 * Implied APY in basis points.
 * A bid represents the price you pay for the right to receive staking yield.
 * APY = (bid / ytAmount) annualised.
 *
 * @param bid              - bid amount in lamports
 * @param ytAmount         - YT tokens in the auction (lamports equivalent)
 * @param timeToEndSecs    - seconds until auction ends / maturity
 */
function computeImpliedApy(bid: number, ytAmount: number, timeToEndSecs: number): number {
  if (ytAmount === 0 || timeToEndSecs <= 0) return 0;
  const SECS_PER_YEAR = 365 * 24 * 3600;
  const yieldFraction = bid / ytAmount;
  const annualised = yieldFraction * (SECS_PER_YEAR / timeToEndSecs);
  return Math.round(annualised * 10_000); // basis points
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Listen for on-chain bid events (alternative to polling) ─────────────────

async function listenForBidEvents(connection: Connection) {
  const coder = new BorshCoder(idl as any);
  const parser = new EventParser(PROGRAM_ID, coder);

  connection.onLogs(PROGRAM_ID, (logs) => {
    const events = parser.parseLogs(logs.logs);
    for (const event of events) {
      if (event.name === "BidPlacedEvent") {
        const { auction, bidder, bidAmount, impliedApyBps } = event.data as any;
        console.log(
          `[Event] BidPlaced on ${auction.toBase58().slice(0, 8)}… ` +
          `by ${bidder.toBase58().slice(0, 8)}… ` +
          `| Amount: ${Number(bidAmount) / 1e9} SOL ` +
          `| APY: ${Number(impliedApyBps) / 100}%`
        );
      }
    }
  });
}

runBidderAgent().catch(console.error);