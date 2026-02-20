export default function ClaimHeader() {
  return (
    <section className="pt-40 pb-16 px-6 border-b border-[#eeeeee]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold mb-6">
          Confidential Claim
        </h2>

        <h1 className="text-4xl md:text-5xl font-medium tracking-tight leading-[1.1] mb-6">
          Claim your private grant.
        </h1>

        <p className="text-lg text-[#666666] max-w-2xl leading-relaxed">
          Submit your zero-knowledge proof to privately claim your allocation.
          Your eligibility remains confidential.
        </p>
      </div>
    </section>
  );
}