import Testing
@testable import RhythmRecovery

struct AppleSignInNonceTests {
    @Test func randomNonceHasRequestedLength() {
        #expect(AppleSignInNonce.random(length: 32).count == 32)
    }

    @Test func randomNonceIsNotConstant() {
        #expect(AppleSignInNonce.random() != AppleSignInNonce.random())
    }

    @Test func sha256IsDeterministicAndHexEncoded() {
        let hash = AppleSignInNonce.sha256("abc")
        #expect(hash == AppleSignInNonce.sha256("abc"))
        #expect(hash.count == 64)
        #expect(hash.allSatisfy { $0.isHexDigit })
    }
}
