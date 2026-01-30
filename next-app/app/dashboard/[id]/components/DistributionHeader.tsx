import { Shield } from "lucide-react";
import { Distribution } from "./types";

export function DistributionHeader({
  distribution,
  totalApplications,
}: {
  distribution: Distribution;
  totalApplications: number;
}) {
  return (
    <div className="border border-[#eeeeee] p-8 mb-12 bg-[#fafafa]">
      <div className="flex flex-col md:flex-row justify-between gap-8 items-baseline">
        <div className="space-y-4 max-w-3xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-medium tracking-tight">
                {distribution.name}
              </h1>
              <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase border border-[#015FFD] text-[#015FFD]">
                {distribution.status}
              </span>
            </div>
            <p className="text-[#666666] text-sm leading-relaxed">
              {distribution.description}
            </p>
          </div>

          <div className="flex gap-8 pt-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#999999] font-bold">
                Deadline
              </p>
              <p className="text-sm font-medium">
                {distribution.deadline}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#999999] font-bold">
                Total Applications
              </p>
              <p className="text-sm font-medium">
                {totalApplications}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-white border border-[#eeeeee] text-[11px] text-[#666666]">
          <Shield size={14} className="text-[#015FFD]" />
          Applications are anonymous
        </div>
      </div>
    </div>
  );
}
