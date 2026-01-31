import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#015FFD] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#eeeeee]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">KLOAK</div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-[#666666]">
            <Link href="#problem" className="hover:text-[#111111] transition-colors">Problem</Link>
            <Link href="#approach" className="hover:text-[#111111] transition-colors">Approach</Link>
            <Link href="#how-it-works" className="hover:text-[#111111] transition-colors">How It Works</Link>
            <Link href="#use-cases" className="hover:text-[#111111] transition-colors">Use Cases</Link>
          </div>
          <Link href="/dashboard" className="bg-[#015FFD] text-white px-5 py-2 text-sm font-medium hover:bg-[#0052db] transition-colors">
            Create a Distribution
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-8 leading-[1.1]">
            Private distribution of value and access.
          </h1>
          <p className="text-xl md:text-2xl text-[#666666] mb-12 max-w-2xl mx-auto leading-relaxed">
            Kloak enables organizations to distribute grants, payroll, and access while keeping eligibility, recipients, and amounts confidential by default.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto bg-[#015FFD] text-white px-8 py-4 text-base font-medium hover:bg-[#0052db] transition-colors text-center">
              Create a Distribution
            </Link>
            <a
              href="https://youtu.be/NLh_GkFCUuE"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white text-[#111111] border border-[#dddddd] px-8 py-4 text-base font-medium hover:border-[#111111] transition-colors text-center"
            >
              Watch Demo
            </a>

          </div>
          <p className="mt-12 text-sm uppercase tracking-widest text-[#999999] font-medium">
            Built for Institutions • Powered by Aleo
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section id="problem" className="py-24 px-6 border-t border-[#eeeeee] bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold mb-12">The Problem</h2>
          <div className="grid md:grid-cols-2 gap-12 md:gap-24">
            <div>
              <p className="text-2xl font-medium mb-6 leading-snug">
                Legacy systems were not designed for the privacy demands of modern organizations.
              </p>
            </div>
            <div className="space-y-8 text-[#444444]">
              <div className="pb-6 border-b border-[#eeeeee]">
                <h3 className="text-[#111111] font-medium mb-2">Internal Data Leakage</h3>
                <p>Grant applications and personal data often leak within organizations, compromising neutral decision-making processes.</p>
              </div>
              <div className="pb-6 border-b border-[#eeeeee]">
                <h3 className="text-[#111111] font-medium mb-2">Observable Decisions</h3>
                <p>Public funding decisions are instantly observable, leading to political pressure and social engineering risks.</p>
              </div>
              <div className="pb-6 border-b border-[#eeeeee]">
                <h3 className="text-[#111111] font-medium mb-2">Public Traceability</h3>
                <p>Standard blockchain distributions expose recipient identities and transaction amounts to the entire world.</p>
              </div>
              <div>
                <h3 className="text-[#111111] font-medium mb-2">The Trust Paradox</h3>
                <p>Traditional platforms require blind trust in centralized administrators who have full visibility into sensitive data.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Approach */}
      <section id="approach" className="py-24 px-6 border-t border-[#eeeeee]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold mb-12">The Kloak Approach</h2>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <p className="text-3xl font-medium leading-tight">
                Privacy by default, not by request.
              </p>
              <p className="text-lg text-[#666666] leading-relaxed">
                Kloak uses Aleo’s zero-knowledge architecture to verify eligibility and authorization without exposing identities, balances, or sensitive data.
              </p>
              <div className="p-8 border border-[#eeeeee] bg-[#fdfdfd]">
                <p className="italic text-[#444444]">
                  "By shifting from trust to verification, institutions can operate with absolute confidentiality while maintaining cryptographic certainty."
                </p>
              </div>
            </div>
            <div className="grid gap-8">
              <div className="p-6 border border-[#eeeeee]">
                <h3 className="font-medium mb-2">Client-Side Encryption</h3>
                <p className="text-[#666666] text-sm">Applications are encrypted on the applicant's device before being submitted, ensuring only authorized parties can ever access the contents.</p>
              </div>
              <div className="p-6 border border-[#eeeeee]">
                <h3 className="font-medium mb-2">Zero-Knowledge Eligibility</h3>
                <p className="text-[#666666] text-sm">Verify that an applicant meets all requirements without them ever revealing their full identity or sensitive background data.</p>
              </div>
              <div className="p-6 border border-[#eeeeee]">
                <h3 className="font-medium mb-2">Confidential Distributions</h3>
                <p className="text-[#666666] text-sm">Execute value transfers that remain private on-chain. No public wallets, no behavioral trails, no exposed amounts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-[#eeeeee] bg-[#111111] text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold mb-20">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-12 relative">
            <div className="space-y-4">
              <div className="text-4xl font-light text-[#015FFD]">01</div>
              <h3 className="text-lg font-medium">Define Distribution</h3>
              <p className="text-[#999999] text-sm leading-relaxed">Set criteria for your private distribution, including eligibility requirements and funding amounts.</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-light text-[#015FFD]">02</div>
              <h3 className="text-lg font-medium">Private Application</h3>
              <p className="text-[#999999] text-sm leading-relaxed">Applicants submit proof of eligibility without revealing their underlying identity or data.</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-light text-[#015FFD]">03</div>
              <h3 className="text-lg font-medium">ZK Verification</h3>
              <p className="text-[#999999] text-sm leading-relaxed">Eligibility is proven via zero-knowledge proofs, verified instantly and cryptographically by the network.</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-light text-[#015FFD]">04</div>
              <h3 className="text-lg font-medium">Confidential Execution</h3>
              <p className="text-[#999999] text-sm leading-relaxed">Decisions are finalized and distributions are sent privately, maintaining absolute confidentiality for all parties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Architecture */}
      <section className="py-24 px-6 border-t border-[#eeeeee]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold mb-8">Trust & Architecture</h2>
              <p className="text-3xl font-medium mb-8 leading-tight">Built for compliance, designed for absolute privacy.</p>
              <div className="space-y-6 text-[#444444]">
                <div className="flex gap-4">
                  <div className="w-1 h-1 mt-2 bg-[#015FFD] shrink-0" />
                  <p><span className="text-[#111111] font-medium">Access is proven, not revealed.</span> We verify attributes without ever seeing the raw data.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-1 h-1 mt-2 bg-[#015FFD] shrink-0" />
                  <p><span className="text-[#111111] font-medium">Untrusted Storage.</span> Our architecture assumes all storage is potentially compromised and encrypts accordingly.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-1 h-1 mt-2 bg-[#015FFD] shrink-0" />
                  <p><span className="text-[#111111] font-medium">No Behavioral Trails.</span> We eliminate the metadata trails that traditional systems leave behind.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-1 h-1 mt-2 bg-[#015FFD] shrink-0" />
                  <p><span className="text-[#111111] font-medium">Selective Disclosure.</span> Audit-ready features allow for controlled transparency when required for compliance.</p>
                </div>
              </div>
            </div>
            <div className="bg-[#fafafa] p-12 border border-[#eeeeee]">
              <div className="space-y-8">
                <div className="h-px bg-[#eeeeee] w-full" />
                <div className="h-px bg-[#eeeeee] w-2/3" />
                <div className="h-px bg-[#eeeeee] w-full" />
                <div className="py-4 text-center">
                  <div className="inline-block px-4 py-2 border border-[#111111] text-xs font-mono uppercase tracking-widest">
                    Cryptographically Verified
                  </div>
                </div>
                <div className="h-px bg-[#eeeeee] w-full" />
                <div className="h-px bg-[#eeeeee] w-3/4" />
                <div className="h-px bg-[#eeeeee] w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 px-6 border-t border-[#eeeeee] bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm uppercase tracking-widest text-[#015FFD] font-bold mb-12">Use Cases</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 bg-white border border-[#eeeeee] hover:border-[#015FFD] transition-colors">
              <h3 className="font-medium mb-3">Private Grants</h3>
              <p className="text-sm text-[#666666]">Distribute research or innovation funds without exposing recipient strategies or identities.</p>
            </div>
            <div className="p-8 bg-white border border-[#eeeeee] hover:border-[#015FFD] transition-colors">
              <h3 className="font-medium mb-3">Confidential Payroll</h3>
              <p className="text-sm text-[#666666]">Manage institutional payroll on-chain while keeping salary data and recipient lists strictly private.</p>
            </div>
            <div className="p-8 bg-white border border-[#eeeeee] hover:border-[#015FFD] transition-colors">
              <h3 className="font-medium mb-3">Private Airdrops</h3>
              <p className="text-sm text-[#666666]">Reward community members based on eligibility without creating public behavioral linked data.</p>
            </div>
            <div className="p-8 bg-white border border-[#eeeeee] hover:border-[#015FFD] transition-colors">
              <h3 className="font-medium mb-3">Restricted Access</h3>
              <p className="text-sm text-[#666666]">Grant access to digital or physical assets based on ZK-verified credentials and authorization.</p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <p className="text-[#666666]">All distributions share the same institutional-grade privacy guarantees.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-[#eeeeee] bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="text-2xl font-bold tracking-tight mb-4">KLOAK</div>
            <p className="text-[#666666] max-w-sm mb-6">
              Institutional privacy for the next generation of value distribution.
            </p>
            <p className="text-xs uppercase tracking-widest text-[#999999] font-medium">
              Built with Aleo
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#111111] font-bold">Resources</h4>
            <div className="flex flex-col space-y-2 text-sm text-[#666666]">
              <Link href="#" className="hover:text-[#015FFD] transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-[#015FFD] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#015FFD] transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[#111111] font-bold">Company</h4>
            <div className="flex flex-col space-y-2 text-sm text-[#666666]">
              <Link href="#" className="hover:text-[#015FFD] transition-colors">Contact</Link>
              <Link href="#" className="hover:text-[#015FFD] transition-colors">About</Link>
              <Link href="#" className="hover:text-[#015FFD] transition-colors">Careers</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#eeeeee] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#999999]">© 2026 Kloak. All rights reserved.</p>
          <p className="text-sm font-medium italic text-[#111111]">Privacy-first by design.</p>
        </div>
      </footer>
    </div>
  );
}
