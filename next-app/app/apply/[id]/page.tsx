"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { findDistributionById } from "@/app/lib/storage/distributions";
import { saveApplication } from "@/app/lib/storage/applications";
import { ApplicationRecord } from "@/app/lib/verifier/types";

import { ApplyDistribution, FlowState } from "./types";
import { renderEligibility } from "@/app/dashboard/create/utils/renderEligibility";

import { mockVerifyEligibility } from "./utils/mockVerifyEligibility";

import { ApplyHeader } from "./components/ApplyHeader";
import { EligibilityGate } from "./components/EligibilityGate";
import { VerifyingState } from "./components/VerifyingState";
import { SuccessState } from "./components/SuccessState";
import { PrivacyNotice } from "./components/PrivacyNotice";
import { ApplicationForm } from "./components/ApplicationForm";

export default function ApplyPage() {
  const params = useParams();
  const id = params.id as string;

  const [flow, setFlow] = useState<FlowState>("form");
  const [loading, setLoading] = useState(true);

  const [distribution, setDistribution] =
    useState<ApplyDistribution | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    links: "",
  });



  /* --------------------------------------------
     Load public distribution
  --------------------------------------------- */
  useEffect(() => {
    if (!id) return;

    const stored = findDistributionById(id);

    if (!stored) {
      setDistribution(null);
      setLoading(false);
      return;
    }

    setDistribution({
      id: stored.id,
      name: stored.data.name,
      description: stored.data.description,
      eligibilityRules: stored.data.eligibilityRules,
    });

    setLoading(false);
  }, [id]);


  /* --------------------------------------------
     Eligibility verification
  --------------------------------------------- */
  const handleVerifyEligibility = async () => {
    if (!distribution) return;

    setFlow("verifying");

    // mock applicant data (demo)
    const applicant = {
      contributionCount: 3,
      joinedAt: 1700000000,
    };

    await new Promise((r) => setTimeout(r, 1500));

    const eligible = mockVerifyEligibility(
      distribution.eligibilityRules,
      applicant
    );

    if (!eligible) {
      setFlow("error");
      return;
    }

    // Persist application on success
    const application: ApplicationRecord = {
      id: crypto.randomUUID(),
      distributionId: distribution.id,
      submittedAt: new Date().toISOString(),
      status: "Submitted",

      title: form.title,
      content: form.description,
      metadata: [
        {
          label: "Category",
          value: form.category,
        },
        ...(form.links.trim()
          ? [
            {
              label: "Supporting Links",
              value: form.links.trim(),
            },
          ]
          : []),
      ],


      proof: {
        type: "mock",
        verified: true,
      },
    };

    saveApplication(application);

    setFlow("success");
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#999999]">
        Loading distribution…
      </div>
    );
  }


  /* --------------------------------------------
     Not found state
  --------------------------------------------- */
  if (!distribution) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#999999]">
        Distribution not found or no longer available.
      </div>
    );
  }

  /* --------------------------------------------
     Verifying
  --------------------------------------------- */
  if (flow === "verifying") {
    return <VerifyingState />;
  }

  /* --------------------------------------------
     Success
  --------------------------------------------- */
  if (flow === "success") {
    return <SuccessState id={distribution.id} />;
  }

  /* --------------------------------------------
     Error (not eligible)
  --------------------------------------------- */
  if (flow === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-medium">You’re not eligible</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Based on the current eligibility rules, your account doesn’t qualify
          for this distribution.
        </p>

        <button
          onClick={() => setFlow("form")}
          className="text-sm underline text-muted-foreground"
        >
          Go back
        </button>
      </div>
    );
  }

  /* --------------------------------------------
     Main flow (form + gate)
  --------------------------------------------- */
  return (
    <div className="min-h-screen flex justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <ApplyHeader
          name={distribution.name}
          description={distribution.description}
        />

        {/* Intro / form step */}
        {flow === "form" && (
          <>
            <ApplicationForm
              title={form.title}
              description={form.description}
              category={form.category}
              links={form.links}
              eligibilityPreview={renderEligibility(
                distribution.eligibilityRules
              )}
              onChange={(field, value) =>
                setForm((prev) => ({
                  ...prev,
                  [field]: value,
                }))
              }
              onContinue={() => setFlow("gate")}
            />



            <PrivacyNotice />
          </>
        )}

        {/* Eligibility gate */}
        {flow === "gate" && (
          <EligibilityGate
            eligibilityRules={distribution.eligibilityRules}
            onBack={() => setFlow("form")}
            onProceed={handleVerifyEligibility}
          />
        )}
      </div>
    </div>
  );
}
