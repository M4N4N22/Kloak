// The 'test_test_program' test program.
import test_program.aleo;
program test_test_program.aleo {
    @test
    @should_fail
    fn do_nothing() {
        let result: u32 = test_program.aleo::main(2u32, 3u32);
        assert_eq(result, 3u32);
    }

    @noupgrade
    constructor() {}
}

@test
script test_it() {
    let result: u32 = test_program.aleo::main(1u32, 2u32);
    assert_eq(result, 3u32);
}
