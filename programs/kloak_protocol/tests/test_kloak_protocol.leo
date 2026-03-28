// The 'test_kloak_protocol' test program.
import kloak_protocol.aleo;
program test_kloak_protocol.aleo {
    @test
    script test_it() {
        let result: u32 = kloak_protocol.aleo/main(1u32, 2u32);
        assert_eq(result, 3u32);
    }

    @test
    @should_fail
    transition do_nothing() {
        let result: u32 = kloak_protocol.aleo/main(2u32, 3u32);
        assert_eq(result, 3u32);
    }

    @noupgrade
    async constructor() {}
}
