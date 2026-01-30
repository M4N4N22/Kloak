"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import { getApplications } from "@/app/lib/storage/applications";


import { DistributionHeader } from "./components/DistributionHeader";
import { ApplicationsTable } from "./components/ApplicationsTable";
import { ApplicationDetail } from "./components/ApplicationDetail";
import { Distribution } from "./components/types";

import { findDistributionById } from "@/app/lib/storage/distributions";

// ✅ Verifier layer (applications still mocked)
import { verifier } from "@/app/lib/verifier";
import { ApplicationRecord } from "@/app/lib/verifier/types";

export default function DistributionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [distribution, setDistribution] =
    useState<Distribution | null>(null);

  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [selected, setSelected] =
    useState<ApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  /* --------------------------------------------
     Load real distribution data
  --------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    const stored = findDistributionById(id);
    if (!stored) return;

    setDistribution({
      id: stored.id,
      name: stored.data.name,
      description: stored.data.description,
      eligibilityPreview: stored.data.eligibilityPreview,
      deadline: stored.data.deadline,
      status:
        stored.data.deadline &&
        new Date(stored.data.deadline).getTime() < Date.now()
          ? "Closed"
          : "Open",
    });
  }, [id]);

/* --------------------------------------------
   Load applications from storage
--------------------------------------------- */
useEffect(() => {
  if (!id) return;

  const storedApps = getApplications(id);
  setApps(storedApps);
  setLoading(false);
}, [id]);

  const handleUpdateStatus = async (
    appId: string,
    status: ApplicationRecord["status"]
  ) => {
    await verifier.updateStatus(appId, status);

    setApps((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, status } : a
      )
    );

    if (selected?.id === appId) {
      setSelected({ ...selected, status });
    }
  };

  /* --------------------------------------------
     Not found
  --------------------------------------------- */
  if (!distribution) {
    return (
      <main className="py-32 text-center text-sm text-[#999999]">
        Distribution not found.
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#999999]"
      >
        <ChevronLeft size={14} />
        Back to Distributions
      </Link>

      {/* Header (real data) */}
      <DistributionHeader
        distribution={distribution}
        totalApplications={apps.length}
      />

      {/* Demo notice (applications only) */}
<div className="mb-8 p-4 border border-[#e5e7eb] bg-[#fafafa] flex gap-3">
  <Info size={16} className="text-[#666666] mt-0.5" />
  <p className="text-sm text-[#666666] leading-relaxed">
    Applications shown below were submitted through the live application flow.
    Review actions (status updates) are currently mocked for testing and UX
    development.
  </p>
</div>


      {/* Content */}
      {loading ? (
        <div className="py-32 text-center text-sm text-[#999999]">
          Loading applications…
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-12">
          <div
            className={`${
              selected ? "lg:col-span-5" : "lg:col-span-12"
            }`}
          >
            <ApplicationsTable
              applications={apps}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          </div>

          {selected && (
            <div className="lg:col-span-7">
              <ApplicationDetail
                application={selected}
                onClose={() => setSelected(null)}
                onUpdateStatus={(status) =>
                  handleUpdateStatus(selected.id, status)
                }
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
