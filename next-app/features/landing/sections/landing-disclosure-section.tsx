import { Fingerprint, Scale, ShieldCheck, Lock, EyeOff } from "lucide-react"
import { SectionHeading } from "@/features/landing/components/section-heading"
import { cn } from "@/lib/utils"

const proofTypes = [
  { title: "Basic Proof", body: "Confirm a transaction exists without details." },
  { title: "Exact Amount", body: "Reveal the specific value for accounting." },
  { title: "Threshold", body: "Prove a minimum (e.g., > 500 USDCx) only." },
]

export function LandingDisclosureSection() {
  return (
    <section id="selective-disclosure" className="relative px-6 py-24 sm:py-32 overflow-hidden">

      <div className="mx-auto max-w-7xl">
        
        <SectionHeading
          eyebrow="Selective Disclosure"
          title="Share less. Prove more."
          description="Transform private data into verifiable statements."
          centered
        />

        <div className="mt-20 grid gap-8 lg:grid-cols-2 lg:items-stretch">
          
          {/* 1. THE SOURCE CARD (The Vault) */}
          <div className="relative flex flex-col justify-between rounded-[3rem] border border-white/5 bg-zinc-900/40 p-10 backdrop-blur-3xl shadow-2xl">
            <div className="space-y-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-primary shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.2)]">
                <Fingerprint className="h-6 w-6" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-bold tracking-tight text-white leading-tight">
                  Your wallet stays <br /> 
                  <span className="text-zinc-600 italic">completely</span> dark.
                </h3>
                <p className="max-w-md text-base leading-relaxed text-zinc-500">
                  Zero-Knowledge Proofs allow you to generate verifiable reports without ever revealing your identity or full history.
                </p>
              </div>
            </div>

            {/* THE "STILL PRIVATE" CHIP LIST */}
            <div className="mt-12 space-y-4">
              <p className="text-xs text-zinc-600 flex items-center gap-2">
                <EyeOff className="h-3 w-3" /> Encrypted by Default
              </p>
              <div className="flex flex-wrap gap-2">
                {["Payer Identity", "Full Balance", "Wallet History", "Timestamp Metadata"].map((item) => (
                  <div key={item} className="rounded-full border border-white/5 bg-black/40 px-4 py-2 text-[11px] font-medium text-zinc-400">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. THE OUTPUTS (The Selectable Proofs) */}
          <div className="flex flex-col gap-4">
            <p className="px-4 text-sm text-zinc-600 mb-2">Available Disclosures</p>
            {proofTypes.map((proof, index) => (
              <div 
                key={proof.title} 
                className="group relative flex items-center gap-6 rounded-full  border p-4 transition-all duration-500  hover:bg-zinc-900/60 hover:translate-x-2"
              >
           

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 text-primary transition-all group-hover:border-primary/20 group-hover:text-primary group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight">{proof.title}</h3>
                  <p className="text-sm text-zinc-500 group-hover:text-zinc-400">{proof.body}</p>
                </div>

             
              </div>
            ))}
            
            {/* The Bottom "Legal/Compliance" Note */}
            <div className="mt-4 rounded-[2rem] border border-dashed border-white/10 p-6">
              <div className="flex items-center gap-3 text-zinc-500">
                <Scale className="h-4 w-4" />
                <p className="text-xs  leading-relaxed">
                  Satisfy regulatory requirements without compromising user sovereignty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}