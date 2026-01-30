"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Step, CreateDistributionForm } from "./types";
import StepBasics from "./steps/StepBasics";
import StepEligibility from "./steps/StepEligibility";
import StepReview from "./steps/StepReview";
import StepSuccess from "./steps/StepSuccess";

export default function CreateDistributionPage() {
  const [step, setStep] = useState<Step>(1);
const [formData, setFormData] = useState<CreateDistributionForm>({
  name: "",
  description: "",
  deadline: "",
  eligibilityRules: [],
  eligibilityPreview: "",
});


  const nextStep = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep("success");
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans">

      <main className="max-w-3xl mx-auto px-6 py-16">
        {step !== "success" && (
          <div className="mb-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-[#666666] hover:text-[#111111] text-sm mb-8"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-medium tracking-tight">
              {step === 1 && "Basic Information"}
              {step === 2 && "Eligibility Rules"}
              {step === 3 && "Review & Confirm"}
            </h1>
          </div>
        )}

        {step === 1 && (
          <StepBasics
            formData={formData}
            setFormData={setFormData}
            onNext={nextStep}
          />
        )}

        {step === 2 && (
          <StepEligibility
            formData={formData}
            setFormData={setFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {step === 3 && (
          <StepReview
            formData={formData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {step === "success" && <StepSuccess formData={formData} />}
      </main>
    </div>
  );
}
