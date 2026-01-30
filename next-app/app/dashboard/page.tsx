import Link from "next/link";
import { Plus, Shield, Lock, Eye } from "lucide-react";
import { ActualDistributions } from "./components/ActualDistributions";


const distributions = [
    {
        id: "dist-001",
        name: "Q1 Research Fellowship Grants",
        status: "Open",
        deadline: "Feb 15, 2026",
        applications: 42,
    },
    {
        id: "dist-002",
        name: "Engineering Core Contributor Payroll",
        status: "Closed",
        deadline: "Jan 10, 2026",
        applications: 12,
    },
    {
        id: "dist-003",
        name: "Governance Council Access Proofs",
        status: "Draft",
        deadline: "Mar 01, 2026",
        applications: 0,
    },
];

export default function Dashboard() {
    const hasDistributions = distributions.length > 0;

    return (
        <div className="min-h-screen bg-white text-[#111111] font-sans">

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-medium tracking-tight">Distributions</h1>
                        <p className="text-[#666666] text-sm">
                            Manage private distributions and review applications without exposing identities or sensitive data.
                        </p>
                    </div>
                    <Link href="/dashboard/create" className="flex items-center justify-center gap-2 bg-[#015FFD] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#0052db] transition-colors whitespace-nowrap">
                        <Plus size={16} />
                        Create Distribution
                    </Link>
                </div>

                <div className="grid lg:grid-cols-4 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-16">
                        {/* REAL DISTRIBUTIONS (Wallet-backed) */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">
                                    Your Distributions
                                </h2>
                            </div>

                            <ActualDistributions />
                        </section>

                        {/* DEMO / MOCKED DISTRIBUTIONS */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">
                                    Demo Distributions
                                </h2>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-[#999999]">
                                    Mock Data
                                </span>
                            </div>

                            {!hasDistributions ? (
                                <div className="py-32 border border-dashed border-[#dddddd] flex flex-col items-center justify-center text-center">
                                    <p className="text-[#666666] mb-6">
                                        Demo distributions are shown below for presentation purposes.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#eeeeee] text-[11px] uppercase tracking-widest text-[#999999] font-bold">
                                                <th className="pb-4">Distribution Name</th>
                                                <th className="pb-4">Status</th>
                                                <th className="pb-4">Deadline</th>
                                                <th className="pb-4">Applications</th>
                                                <th className="pb-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {distributions.map((dist) => (
                                                <tr
                                                    key={dist.id}
                                                    className="border-b border-[#eeeeee] hover:bg-[#fafafa] transition-colors"
                                                >
                                                    <td className="py-5 font-medium">{dist.name}</td>
                                                    <td className="py-5">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${dist.status === "Open"
                                                                ? "border-[#015FFD] text-[#015FFD]"
                                                                : dist.status === "Draft"
                                                                    ? "border-[#999999] text-[#999999]"
                                                                    : "border-[#111111] text-[#111111]"
                                                                }`}
                                                        >
                                                            {dist.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 text-[#666666]">
                                                        {dist.deadline}
                                                    </td>
                                                    <td className="py-5 text-[#666666]">
                                                        {dist.applications}
                                                    </td>
                                                    <td className="py-5 text-right">
                                                        <Link
                                                            href={`/dashboard/${dist.id}`}
                                                            className="inline-flex items-center gap-1.5 text-[#015FFD] font-medium hover:underline text-xs"
                                                        >
                                                            View <Eye size={14} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <p className="text-xs text-[#999999] italic">
                                Demo distributions are hardcoded for presentation purposes only.
                                Actual distributions are created via wallet signatures and stored
                                locally.
                            </p>
                        </section>
                    </div>


                    {/* Privacy Assurance Sidebar */}
                    <aside className="space-y-8">
                        <div className="p-6 bg-[#fafafa] border border-[#eeeeee] space-y-6">
                            <h3 className="text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                                <Shield size={14} className="text-[#015FFD]" />
                                Privacy Enforcement
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Lock size={12} />
                                        Zero-Knowledge
                                    </p>
                                    <p className="text-xs text-[#666666] leading-relaxed">
                                        Eligibility is verified using zero-knowledge proofs. Applicant data is never stored in plaintext.
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Lock size={12} />
                                        Identity Protection
                                    </p>
                                    <p className="text-xs text-[#666666] leading-relaxed">
                                        Applicant identities are never exposed to the issuer or any third party during the review process.
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <Lock size={12} />
                                        No Metadata Trails
                                    </p>
                                    <p className="text-xs text-[#666666] leading-relaxed">
                                        Kloak architecture prevents the creation of public applicant lists or behavioral logs.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-l-2 border-[#015FFD] bg-white">
                            <p className="text-[11px] text-[#999999] uppercase tracking-widest font-bold mb-1">Status</p>
                            <p className="text-sm font-medium">Compliance-Ready</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
