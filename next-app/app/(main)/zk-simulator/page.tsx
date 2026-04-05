"use client"

import { useState } from "react"
import { useMerkleCampaignSimulator } from "@/hooks/useMerkleCampaignSimulator"

export default function ZKSimulatorPage() {

  const { simulate, result } = useMerkleCampaignSimulator()

  const [campaignId, setCampaignId] = useState(
    "3242230099934600186367206315707010338524161378067915800148782094887127450529field"
  )

  const [csv, setCsv] = useState(`aleo1ryjv7hmxyc0ty7mtpe5auhqs992jrtn4r3s45lh7ph5mm5p67crsupmn7l,0.1
aleo1l5ukuke6t3wzg8fzuvkk8yxjnqye8vslyx87zxjl6fwaupaujcpq2uvuh4,0.2`)

  const [loading, setLoading] = useState(false)

  async function runSimulation() {

    try {

      setLoading(true)

      const rows = csv
        .split("\n")
        .map((line) => {

          const [address, amount] = line.split(",")

          return {
            address: address.trim(),
            amount: Number(amount.trim())
          }
        })

      await simulate(rows, campaignId)

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="min-h-screen bg-black text-foreground p-10 font-mono">

      <h1 className="text-2xl font-bold text-yellow-400 mb-8">
        Merkle Campaign Simulator
      </h1>

      {/* Campaign ID */}

      <div className="mb-6">

        <p className="mb-2 text-gray-400">Campaign ID</p>

        <input
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="bg-gray-900 border border-gray-700 p-3 rounded w-full"
        />

      </div>

      {/* CSV Input */}

      <div className="mb-6">

        <p className="mb-2 text-gray-400">CSV Input</p>

        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="bg-gray-900 border border-gray-700 p-3 rounded w-full h-32"
        />

      </div>

      {/* Run Button */}

      <button
        onClick={runSimulation}
        className="bg-blue-600 px-6 py-3 rounded font-bold"
      >
        {loading ? "Simulating..." : "Run Simulation"}
      </button>

      {/* Results */}

      {result && (

        <div className="mt-10 space-y-8">

          {/* Root */}

          <div className="bg-gray-900 p-6 rounded border border-gray-700">

            <h2 className="text-green-400 mb-3">
              Merkle Root
            </h2>

            <p className="break-all text-yellow-300">
              {result.root}
            </p>

          </div>

          {/* Proofs */}

          <div className="bg-gray-900 p-6 rounded border border-gray-700">

            <h2 className="text-blue-400 mb-3">
              Generated Proofs
            </h2>

            {result.proofs.map((p: any, i: number) => (

              <div
                key={i}
                className="mb-4 border-b border-gray-800 pb-3"
              >

                <p className="text-purple-300">
                  {p.address}
                </p>

                <p className="text-gray-400 text-sm">
                  payout: {p.payout}
                </p>

                <p className="text-gray-400 text-xs break-all">
                  leaf: {p.leaf.toString()}
                </p>

              </div>

            ))}

          </div>

          {/* Verification */}

          <div className="bg-gray-900 p-6 rounded border border-gray-700">

            <h2 className="text-purple-400 mb-3">
              Proof Verification
            </h2>

            {result.verifications.map((v: any, i: number) => (

              <div
                key={i}
                className="flex justify-between border-b border-gray-800 py-2"
              >

                <span>{v.address}</span>

                <span
                  className={
                    v.matches
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {v.matches ? "VALID" : "INVALID"}
                </span>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  )
}