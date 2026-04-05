"use client"

import { useState } from "react"

export default function AleoTxDebug() {

  const [txId, setTxId] = useState("")
  const [result, setResult] = useState<any>(null)

  async function testTx() {

    const res = await fetch("/api/debug/aleo-tx", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ txId })
    })

    const data = await res.json()

    setResult(data)
  }

  return (
    <div className="p-10 space-y-6">

      <h1 className="text-xl font-bold">
        Aleo Transaction Debugger
      </h1>

      <input
        className="border px-4 py-2 w-full"
        placeholder="Enter txId"
        value={txId}
        onChange={(e) => setTxId(e.target.value)}
      />

      <button
        onClick={testTx}
        className="px-6 py-2 bg-black text-foreground rounded"
      >
        Fetch Transaction
      </button>

      {result && (
        <pre className="text-xs bg-black text-green-400 p-4 overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

    </div>
  )
}