export default function StepMerkleProof() {
  return (
    <div className="border border-[#eeeeee] p-10">
      <h3 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold mb-6">
        Step 2 — Provide Merkle Proof
      </h3>

      <div className="grid gap-6">
        <input
          placeholder="Merkle Root"
          className="border border-[#dddddd] px-4 py-3 text-sm focus:outline-none focus:border-[#015FFD]"
        />
        <input
          placeholder="Payout (u64)"
          className="border border-[#dddddd] px-4 py-3 text-sm focus:outline-none focus:border-[#015FFD]"
        />
      </div>
    </div>
  );
}