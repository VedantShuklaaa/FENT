import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Fent } from "../target/types/fent";
import { createMint, createAssociatedTokenAccount, mintTo, getAccount } from "@solana/spl-token";
import { assert, expect } from "chai";

// ─── Helpers ────────────────────────────────────────────────────

function pda(seeds: (Buffer | Uint8Array)[], programId: anchor.web3.PublicKey) {
    return anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
}

const LAMPORTS = anchor.web3.LAMPORTS_PER_SOL;

// ─── Test Suite ─────────────────────────────────────────────────

describe("fent", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Fent as Program<Fent>;
    const connection = provider.connection;

    // Actors
    const admin = anchor.web3.Keypair.generate();
    const user = anchor.web3.Keypair.generate();
    const bidder = anchor.web3.Keypair.generate();

    // Token mints
    let jitoSolMint: anchor.web3.PublicKey;

    // PDA keys (derived before tests run)
    let protocolConfigPda: anchor.web3.PublicKey;
    let lstInfoPda: anchor.web3.PublicKey;
    let marketPda: anchor.web3.PublicKey;
    let positionPda: anchor.web3.PublicKey;
    let auctionPda: anchor.web3.PublicKey;
    let bidPda: anchor.web3.PublicKey;

    const maturityTs = new BN(Math.floor(Date.now() / 1000) + 90 * 24 * 3600); // 90 days
    const ROUND = new BN(1);

    // ── Setup ──────────────────────────────────────────────────────

    before(async () => {
        // Airdrop to all actors
        for (const kp of [admin, user, bidder]) {
            const sig = await connection.requestAirdrop(kp.publicKey, 10 * LAMPORTS);
            await connection.confirmTransaction(sig);
        }

        // Create a mock jitoSOL mint (admin is the authority)
        jitoSolMint = await createMint(
            connection,
            admin,
            admin.publicKey,
            null,
            9  // 9 decimals like real jitoSOL
        );

        // Derive PDAs
        [protocolConfigPda] = pda([Buffer.from("protocol_config")], program.programId);
        [lstInfoPda] = pda([Buffer.from("lst_info"), jitoSolMint.toBuffer()], program.programId);
        [marketPda] = pda([
            Buffer.from("market"),
            jitoSolMint.toBuffer(),
            maturityTs.toArrayLike(Buffer, "le", 8),
        ], program.programId);
        [positionPda] = pda([Buffer.from("position"), user.publicKey.toBuffer(), marketPda.toBuffer()], program.programId);
        [auctionPda] = pda([Buffer.from("auction"), marketPda.toBuffer(), ROUND.toArrayLike(Buffer, "le", 8)], program.programId);
        [bidPda] = pda([Buffer.from("bid"), auctionPda.toBuffer(), bidder.publicKey.toBuffer()], program.programId);
    });

    // ── 1. Initialize Protocol ─────────────────────────────────────

    it("initializes the protocol", async () => {
        await program.methods
            .initializeProtocol(30) // 0.30% fee
            .accounts({
                protocolConfig: protocolConfigPda,
                admin: admin.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        const config = await program.account.protocolConfig.fetch(protocolConfigPda);
        assert.equal(config.admin.toBase58(), admin.publicKey.toBase58());
        assert.equal(config.feeBps, 30);
        assert.equal(config.marketCount.toNumber(), 0);
    });

    it("fails if non-admin tries to re-initialize", async () => {
        try {
            await program.methods
                .initializeProtocol(50)
                .accounts({
                    protocolConfig: protocolConfigPda,
                    admin: user.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([user])
                .rpc();
            assert.fail("Should have thrown — account already exists");
        } catch (err: any) {
            // Anchor throws when trying to re-init an existing account
            expect(err.toString()).to.include("already in use");
        }
    });

    // ── 2. Register LST ────────────────────────────────────────────

    it("registers jitoSOL as a supported LST", async () => {
        await program.methods
            .registerLst("jitoSOL", "Jito Liquid Staking Token")
            .accounts({
                lstInfo: lstInfoPda,
                lstMint: jitoSolMint,
                protocolConfig: protocolConfigPda,
                admin: admin.publicKey,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        const info = await program.account.lstInfo.fetch(lstInfoPda);
        assert.equal(info.symbol, "jitoSOL");
        assert.isTrue(info.isActive);
    });

    it("fails when non-admin tries to register an LST", async () => {
        const fakeMint = anchor.web3.Keypair.generate();
        try {
            await program.methods
                .registerLst("fakeLST", "Fake LST")
                .accounts({
                    lstInfo: (pda([Buffer.from("lst_info"), fakeMint.publicKey.toBuffer()], program.programId))[0],
                    lstMint: jitoSolMint,
                    protocolConfig: protocolConfigPda,
                    admin: user.publicKey,  // <-- not admin
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([user])
                .rpc();
            assert.fail("Should have thrown Unauthorized");
        } catch (err: any) {
            expect(err.error?.errorCode?.code).to.equal("Unauthorized");
        }
    });

    // ── 3. Initialize Market ───────────────────────────────────────

    it("creates a jitoSOL market with future maturity", async () => {
        const [ptMintPda] = pda([Buffer.from("pt_mint"), marketPda.toBuffer()], program.programId);
        const [ytMintPda] = pda([Buffer.from("yt_mint"), marketPda.toBuffer()], program.programId);
        const [vaultPda] = pda([Buffer.from("vault"), marketPda.toBuffer()], program.programId);

        await program.methods
            .initializeMarket(maturityTs)
            .accounts({
                market: marketPda,
                ptMint: ptMintPda,
                ytMint: ytMintPda,
                vault: vaultPda,
                lstInfo: lstInfoPda,
                lstMint: jitoSolMint,
                protocolConfig: protocolConfigPda,
                payer: admin.publicKey,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([admin])
            .rpc();

        const market = await program.account.market.fetch(marketPda);
        assert.equal(market.lstMint.toBase58(), jitoSolMint.toBase58());
        assert.equal(market.maturityTs.toNumber(), maturityTs.toNumber());
        assert.isFalse(market.isSettled);

        // Protocol market count incremented
        const config = await program.account.protocolConfig.fetch(protocolConfigPda);
        assert.equal(config.marketCount.toNumber(), 1);
    });

    it("fails to create a market with maturity in the past", async () => {
        const pastTs = new BN(Math.floor(Date.now() / 1000) - 100);
        const [badMarketPda] = pda([
            Buffer.from("market"),
            jitoSolMint.toBuffer(),
            pastTs.toArrayLike(Buffer, "le", 8),
        ], program.programId);

        try {
            await program.methods
                .initializeMarket(pastTs)
                .accounts({
                    market: badMarketPda,
                    // ... other accounts
                })
                .rpc();
            assert.fail("Should have thrown MaturityInPast");
        } catch (err: any) {
            expect(err.error?.errorCode?.code).to.equal("MaturityInPast");
        }
    });

    // ── 4. Deposit ─────────────────────────────────────────────────

    let userLstAccount: anchor.web3.PublicKey;
    const depositAmount = new BN(100 * 10 ** 9); // 100 jitoSOL

    it("mints jitoSOL to user and user deposits into market", async () => {
        // Create user's jitoSOL token account and mint to it
        userLstAccount = await createAssociatedTokenAccount(
            connection, user, jitoSolMint, user.publicKey
        );
        await mintTo(connection, admin, jitoSolMint, userLstAccount, admin, BigInt(200 * 10 ** 9));

        const [vaultPda] = pda([Buffer.from("vault"), marketPda.toBuffer()], program.programId);
        const [actCounterPda] = pda([Buffer.from("activity_counter"), user.publicKey.toBuffer()], program.programId);
        const [actRecordPda] = pda([Buffer.from("activity"), user.publicKey.toBuffer(), new BN(0).toArrayLike(Buffer, "le", 8)], program.programId);

        await program.methods
            .deposit(depositAmount)
            .accounts({
                market: marketPda,
                position: positionPda,
                vault: vaultPda,
                userLstAccount: userLstAccount,
                lstMint: jitoSolMint,
                activityCounter: actCounterPda,
                activityRecord: actRecordPda,
                user: user.publicKey,
                protocolConfig: protocolConfigPda,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([user])
            .rpc();

        // Verify vault received the tokens
        const vaultAccount = await getAccount(connection, vaultPda);
        assert.equal(vaultAccount.amount.toString(), depositAmount.toString());

        // Verify position updated
        const position = await program.account.position.fetch(positionPda);
        assert.equal(position.depositedAmount.toString(), depositAmount.toString());
        assert.equal(position.ptAmount.toNumber(), 0);
    });

    it("fails to deposit zero amount", async () => {
        const [vaultPda] = pda([Buffer.from("vault"), marketPda.toBuffer()], program.programId);
        try {
            await program.methods
                .deposit(new BN(0))
                .accounts({ market: marketPda, /* ... */ })
                .rpc();
            assert.fail("Should throw ZeroAmount");
        } catch (err: any) {
            expect(err.error?.errorCode?.code).to.equal("ZeroAmount");
        }
    });

    // ── 5. Split Position ──────────────────────────────────────────

    it("splits deposit into PT and YT tokens", async () => {
        const splitAmount = new BN(100 * 10 ** 9);
        const [ptMintPda] = pda([Buffer.from("pt_mint"), marketPda.toBuffer()], program.programId);
        const [ytMintPda] = pda([Buffer.from("yt_mint"), marketPda.toBuffer()], program.programId);
        const [actCounterPda] = pda([Buffer.from("activity_counter"), user.publicKey.toBuffer()], program.programId);
        const counter = await program.account.activityCounter.fetch(actCounterPda);
        const [actRecordPda] = pda([Buffer.from("activity"), user.publicKey.toBuffer(), counter.count.toArrayLike(Buffer, "le", 8)], program.programId);

        const userPtAccount = await anchor.utils.token.associatedAddress({ mint: ptMintPda, owner: user.publicKey });
        const userYtAccount = await anchor.utils.token.associatedAddress({ mint: ytMintPda, owner: user.publicKey });

        await program.methods
            .splitPosition(splitAmount)
            .accounts({
                market: marketPda,
                position: positionPda,
                ptMint: ptMintPda,
                ytMint: ytMintPda,
                userPtAccount,
                userYtAccount,
                activityCounter: actCounterPda,
                activityRecord: actRecordPda,
                user: user.publicKey,
                owner: user.publicKey,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([user])
            .rpc();

        // Verify user received PT and YT
        const ptAcc = await getAccount(connection, userPtAccount);
        const ytAcc = await getAccount(connection, userYtAccount);
        assert.equal(ptAcc.amount.toString(), splitAmount.toString());
        assert.equal(ytAcc.amount.toString(), splitAmount.toString());

        // Position updated
        const position = await program.account.position.fetch(positionPda);
        assert.equal(position.depositedAmount.toNumber(), 0);
        assert.equal(position.ptAmount.toString(), splitAmount.toString());
    });

    it("fails to split more than deposited", async () => {
        try {
            await program.methods
                .splitPosition(new BN(999_999 * 10 ** 9))
                .accounts({ market: marketPda, position: positionPda /* ... */ })
                .rpc();
            assert.fail("Should throw InsufficientDeposit");
        } catch (err: any) {
            expect(err.error?.errorCode?.code).to.equal("InsufficientDeposit");
        }
    });

    // ── 6. Auction ─────────────────────────────────────────────────

    it("creates an auction round", async () => {
        await program.methods
            .createAuction(
                ROUND,
                new BN(3600),         // 1 hour
                new BN(0.96 * 10 ** 9) // min bid 0.96 jitoSOL per PT
            )
            .accounts({
                auction: auctionPda,
                market: marketPda,
                payer: admin.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([admin])
            .rpc();

        const auction = await program.account.auction.fetch(auctionPda);
        assert.equal(auction.round.toNumber(), 1);
        assert.deepEqual(auction.status, { open: {} });
    });

    it("bidder places a bid", async () => {
        const bidPrice = new BN(0.97 * 10 ** 9);
        const bidQuantity = new BN(10 * 10 ** 9);

        await program.methods
            .placeBid(bidPrice, bidQuantity)
            .accounts({
                auction: auctionPda,
                bid: bidPda,
                bidder: bidder.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([bidder])
            .rpc();

        const bid = await program.account.bid.fetch(bidPda);
        assert.equal(bid.price.toString(), bidPrice.toString());
        assert.equal(bid.quantity.toString(), bidQuantity.toString());
        assert.isFalse(bid.withdrawn);
    });

    it("fails bid below minimum price", async () => {
        const [lowBidPda] = pda([Buffer.from("bid"), auctionPda.toBuffer(), admin.publicKey.toBuffer()], program.programId);
        try {
            await program.methods
                .placeBid(new BN(0.5 * 10 ** 9), new BN(5 * 10 ** 9))
                .accounts({
                    auction: auctionPda,
                    bid: lowBidPda,
                    bidder: admin.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([admin])
                .rpc();
            assert.fail("Should throw BidPriceTooLow");
        } catch (err: any) {
            expect(err.error?.errorCode?.code).to.equal("BidPriceTooLow");
        }
    });

    // Settlement requires auction to be past end_ts so we skip
    // the settle + withdraw tests here and note them as integration tests.
    // In CI, use a very short duration (1 second) then wait + settle.

    // ── 7. Redemption (simulated maturity) ────────────────────────
    //
    // NOTE: We can't easily fast-forward time on localnet.
    // In a real test setup, either:
    //   a) Create a market with maturity_ts = now + 2 seconds, then wait
    //   b) Use a program flag for test mode that bypasses time checks
    // For demonstration, this test documents the expected behavior.

    it("documents: redeem_pt fails before maturity", async () => {
        const [ptMintPda] = pda([Buffer.from("pt_mint"), marketPda.toBuffer()], program.programId);
        const [vaultPda] = pda([Buffer.from("vault"), marketPda.toBuffer()], program.programId);
        const [actCounterPda] = pda([Buffer.from("activity_counter"), user.publicKey.toBuffer()], program.programId);
        const counter = await program.account.activityCounter.fetch(actCounterPda);
        const [actRecordPda] = pda([Buffer.from("activity"), user.publicKey.toBuffer(), counter.count.toArrayLike(Buffer, "le", 8)], program.programId);
        const userPtAccount = await anchor.utils.token.associatedAddress({ mint: ptMintPda, owner: user.publicKey });

        try {
            await program.methods
                .redeemPt(new BN(10 * 10 ** 9))
                .accounts({
                    market: marketPda,
                    position: positionPda,
                    ptMint: ptMintPda,
                    userPtAccount,
                    vault: vaultPda,
                    userLstAccount: userLstAccount,
                    activityCounter: actCounterPda,
                    activityRecord: actRecordPda,
                    user: user.publicKey,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .signers([user])
                .rpc();
            assert.fail("Should throw NotMaturedYet");
        } catch (err: any) {
            expect(err.error?.errorCode?.code).to.equal("NotMaturedYet");
        }
    });

    // ── 8. Activity Records ───────────────────────────────────────

    it("fetches all activity records for the user", async () => {
        const [actCounterPda] = pda([Buffer.from("activity_counter"), user.publicKey.toBuffer()], program.programId);
        const counter = await program.account.activityCounter.fetch(actCounterPda);
        const count = counter.count.toNumber();

        // Fetch each record by index
        const records = await Promise.all(
            Array.from({ length: count }, (_, i) => {
                const [recordPda] = pda([
                    Buffer.from("activity"),
                    user.publicKey.toBuffer(),
                    new BN(i).toArrayLike(Buffer, "le", 8),
                ], program.programId);
                return program.account.activityRecord.fetch(recordPda);
            })
        );

        assert.isAtLeast(records.length, 2); // at least deposit + split
        // First record should be Deposit
        assert.deepEqual(records[0].activityType, { deposit: {} });
        // Second should be Split
        assert.deepEqual(records[1].activityType, { split: {} });
    });
});