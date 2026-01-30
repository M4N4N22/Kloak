import {
  CheckCircle2,
  Clock,
  Eye,
  ArrowRight,
  Info,
} from "lucide-react";
import { ApplicationRecord } from "@/app/lib/verifier/types";

export function ApplicationsTable({
  applications,
  selectedId,
  onSelect,
}: {
  applications: ApplicationRecord[];
  selectedId: string | null;
  onSelect: (app: ApplicationRecord) => void;
}) {

  return (
    <div className="space-y-6">
      <div className="flex justify-between border-b border-[#eeeeee] pb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest">
          Applications
        </h2>
        <div className="flex items-center gap-2 text-[11px] text-[#999999]">
          <Info size={12} />
          Manual review flow enabled
        </div>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-[#999999] font-bold">
            <th>ID</th>
            {!selectedId && <th>Date</th>}
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>

        <tbody className="text-sm">
          {applications.map((app) => (
            <tr
              key={app.id}
              className={`border-b border-[#eeeeee] ${
                selectedId === app.id
                  ? "bg-[#f0f7ff]"
                  : "hover:bg-[#fafafa]"
              }`}
            >
              <td className="py-4 font-mono text-[11px] text-[#666666]">
                {app.id}
              </td>

              {!selectedId && (
                <td className="py-4 text-[#666666]">
                  {app.submittedAt}
                </td>
              )}

              <td className="py-4">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase">
                  {app.status === "Selected" && (
                    <CheckCircle2 size={10} />
                  )}
                  {app.status === "Reviewed" && (
                    <Eye size={10} />
                  )}
                  {app.status === "Submitted" && (
                    <Clock size={10} />
                  )}
                  {app.status}
                </span>
              </td>

              <td className="py-4 text-right">
                <button
                  onClick={() => onSelect(app)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#015FFD]"
                >
                  View <ArrowRight size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
