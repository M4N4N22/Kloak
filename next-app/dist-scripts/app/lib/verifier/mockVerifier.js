export class MockVerifier {
    async fetchApplications(distributionId) {
        // ⛔ DEMO ONLY
        // Simulates verified, anonymous applications
        return [
            {
                id: "APP-XK-942",
                distributionId,
                submittedAt: "2026-01-24",
                status: "Submitted",
                title: "Optimizing Recursive SNARKs for Mobile Clients",
                content: "Reducing memory footprint of recursive SNARK verification on ARM64...",
                metadata: [
                    { label: "Technical Readiness", value: "Level 3 (Prototype)" },
                    { label: "Estimated Timeline", value: "6 Months" },
                ],
                proof: {
                    type: "mock",
                    verified: true,
                },
            },
            {
                id: "APP-XK-056",
                distributionId,
                submittedAt: "2026-01-19",
                status: "Selected",
                title: "Formal Verification of Privacy Bridges",
                content: "Using K framework to formally verify ZK bridge state transitions...",
                metadata: [
                    { label: "Technical Readiness", value: "Level 4 (Beta)" },
                    { label: "Estimated Timeline", value: "8 Months" },
                ],
                proof: {
                    type: "mock",
                    verified: true,
                },
            },
        ];
    }
    async updateStatus(applicationId, status) {
        // ⛔ DEMO ONLY
        // Pretend this is persisted securely
        return { ok: true };
    }
}
