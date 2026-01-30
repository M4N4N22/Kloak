"use client";

import { ChevronRight } from "lucide-react";
import { CreateDistributionForm } from "../types";

type Props = {
  formData: CreateDistributionForm;
  setFormData: React.Dispatch<
    React.SetStateAction<CreateDistributionForm>
  >;
  onNext: () => void;
};

export default function StepBasics({
  formData,
  setFormData,
  onNext,
}: Props) {
  const isValid =
    formData.name.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.deadline.length > 0;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-6">
        {/* Distribution Name */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-xs font-bold uppercase tracking-widest"
          >
            Distribution Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="e.g. Q1 Research Fellowship Grants"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-[#fafafa] border border-[#eeeeee] px-4 py-3 text-sm
              focus:outline-none focus:border-[#015FFD] transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-xs font-bold uppercase tracking-widest"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Provide details about the distribution..."
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-[#fafafa] border border-[#eeeeee] px-4 py-3 text-sm
              focus:outline-none focus:border-[#015FFD] transition-colors resize-none"
          />
          <p className="text-[11px] text-[#999999]">
            This description is public. Applications and identities remain
            private.
          </p>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <label
            htmlFor="deadline"
            className="text-xs font-bold uppercase tracking-widest"
          >
            Application Deadline
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full bg-[#fafafa] border border-[#eeeeee] px-4 py-3 text-sm
              focus:outline-none focus:border-[#015FFD] transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex items-center justify-center gap-2
            bg-[#015FFD] text-white px-8 py-3 text-sm font-medium
            hover:bg-[#0052db] transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Eligibility
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
