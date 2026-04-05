"use client"

import { useEffect } from "react"

export default function EmbedDemoPage() {

  useEffect(() => {
    // Load embed script dynamically (like real external site)
    const script = document.createElement("script")
    script.src = "http://localhost:3000/embed/embed.js"
    script.async = true

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen bg-foreground text-black">

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Build Faster with Kloak Payments
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Accept private payments directly inside your product.
        </p>

        {/* PRIMARY CTA */}
        <button
          data-kloak-id="cmmmqzjft0000ecgqtld6n7ma"
          className="px-6 py-3 rounded-xl bg-black text-foreground font-semibold hover:opacity-80 transition"
        >
          Buy Access 1 Aleo
        </button>
      </section>

      {/* PRICING SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">

        {/* PLAN 1 */}
        <div className="border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Starter</h2>
          <p className="text-gray-500">Basic access</p>

          <div className="text-3xl font-bold">₹100</div>

          <button
            data-kloak-id="demo-link-id-2"
            data-kloak-amount="100"
            className="w-full py-2 rounded-lg bg-black text-foreground"
          >
            Pay ₹100
          </button>
        </div>

        {/* PLAN 2 */}
        <div className="border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="text-gray-500">Most popular</p>

          <div className="text-3xl font-bold">₹500</div>

          <button
            data-kloak-id="demo-link-id-3"
            data-kloak-amount="500"
            className="w-full py-2 rounded-lg bg-black text-foreground"
          >
            Pay ₹500
          </button>
        </div>

        {/* PLAN 3 */}
        <div className="border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Custom</h2>
          <p className="text-gray-500">Choose your amount</p>

          <div className="text-3xl font-bold">Flexible</div>

          <button
            data-kloak-id="demo-link-id-4"
            className="w-full py-2 rounded-lg bg-black text-foreground"
          >
            Pay Custom Amount
          </button>
        </div>

      </section>

      {/* CREATOR SECTION */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Support this creator
        </h2>

        <p className="text-gray-600 mb-6">
          Send a private contribution using Kloak.
        </p>

        <button
          data-kloak-id="demo-link-id-5"
          className="px-6 py-3 rounded-full bg-black text-foreground"
        >
          Donate
        </button>
      </section>

    </div>
  )
}