program eligibility.aleo {

    transition prove_eligibility(
        private contribution_count: u32,
        private joined_at: u64,

        min_contributions: u32,
        joined_before: u64,
    ) {
        assert(contribution_count >= min_contributions);
        assert(joined_at < joined_before);
    }

    @noupgrade
    async constructor() {}
}
