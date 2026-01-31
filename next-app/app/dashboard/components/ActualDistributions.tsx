"use client";

import Link from "next/link";
import { Eye, Plus, Copy, Check } from "lucide-react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { getDistributions } from "@/app/lib/storage/distributions";
import { useState } from "react";

/* --------------------------------------------
   Helpers
--------------------------------------------- */
function formatDate(date: number | string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function getStatus(deadline?: string) {
  if (!deadline) return "Open";
  return new Date(deadline).getTime() < Date.now()
    ? "Closed"
    : "Open";
}

export function ActualDistributions() {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return (
      <div className="py-16 border border-dashed border-[#dddddd] text-center">
        <p className="text-[#666666] mb-4">
          Connect your wallet to view your created distributions.
        </p>
      </div>
    );
  }

  const distributions = getDistributions(publicKey);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyShareLink = async (id: string) => {
    const link = `${window.location.origin}/apply/${id}`;

    try {
      await navigator.clipboard.writeText(link);

      // mark this row as copied
      setCopiedId(id);

      // reset after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };


  if (distributions.length === 0) {
    return (
      <div className="py-16 border border-dashed border-[#dddddd] flex flex-col items-center text-center">
        <p className="text-[#666666] mb-6">
          You haven’t created any distributions yet.
        </p>
        <Link
          href="/dashboard/create"
          className="flex items-center gap-2 bg-[#015FFD] text-white px-6 py-3 text-sm font-medium hover:bg-[#0052db]"
        >
          <Plus size={16} />
          Create Distribution
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#eeeeee]  text-[11px] uppercase tracking-widest text-[#999999] font-bold">
            <th className="pb-4">Distribution</th>
            <th className="pb-4">Status</th>
            <th className="pb-4">Deadline</th>
            <th className="pb-4 textht">Actions</th>
          </tr>
        </thead>

        <tbody className="text-sm ">
          {distributions.map((dist) => {
            const status = getStatus(dist.data.deadline);

            return (
              <tr
                key={dist.id}
                className="border-b border-[#eeeeee] hover:bg-[#fafafa] "
              >
                {/* Name + Eligibility */}
                <td className="py-5  align-top">
                  <div className="font-medium">
                    {dist.data.name}
                  </div>
                  <div className="text-xs text-[#666666] mt-1">
                    {dist.data.eligibilityPreview ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {dist.data.eligibilityPreview
                          .split(".")
                          .map(point => point.trim())
                          .filter(Boolean)
                          .map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                      </ul>
                    ) : (
                      "Open to all"
                    )}
                  </div>

                </td>



                {/* Status */}
                <td className="py-5 align-top">
                  <span
                    className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase
                      ${status === "Open"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                  >
                    {status}
                  </span>
                </td>
                {/* Deadline */}
                <td className="py-5 text-sm text-[#666666] align-top">
                  {dist.data.deadline
                    ? formatDate(dist.data.deadline)
                    : "—"}
                </td>
                {/* Actions */}
                <td className="py-5 text-right  align-top">
                  <div className=" gap-4 flex flex-col  ">


                    <button
                      onClick={() => copyShareLink(dist.id)}
                      className="inline-flex items-center gap-1.5 text-xs transition-colors
                     text-[#666666] hover:text-[#111111]"
                    >
                      {copiedId === dist.id ? (
                        <>
                          <Check size={14} className="text-green-600" />
                          Copied Shareable Link!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy Shareable Link
                        </>
                      )}
                    </button>
                    <Link
                      href={`/dashboard/${dist.id}`}
                      className="inline-flex items-end gap-1.5 text-[#015FFD] font-medium hover:underline text-xs"
                    >
                      View <Eye size={14} />
                    </Link>

                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
