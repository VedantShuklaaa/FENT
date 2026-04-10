import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";

describe("ryvex-anchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.RyvexAnchor as Program;

  it("Initializes the program", async () => {
    const tx = await program.methods
      .initialize()
      .rpc();
    console.log("Transaction signature", tx);
    assert.ok(tx);
  });
});