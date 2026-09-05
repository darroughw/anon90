import CryptoKit
import Foundation

/// Nonce plumbing for Sign in with Apple, per Apple's replay-protection contract: the app
/// sends `sha256(nonce)` as the Apple request's nonce, Apple embeds that hash in the identity
/// token's `nonce` claim, and the *raw* nonce is forwarded to Supabase — which hashes it again
/// server-side and compares against the token's claim.
enum AppleSignInNonce {
    static func random(length: Int = 32) -> String {
        precondition(length > 0)
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            let randomBytes: [UInt8] = (0 ..< 16).map { _ in UInt8.random(in: 0...255) }
            for random in randomBytes {
                guard remainingLength > 0 else { break }
                if random < charset.count {
                    result.append(charset[Int(random)])
                    remainingLength -= 1
                }
            }
        }

        return result
    }

    static func sha256(_ input: String) -> String {
        let hashed = SHA256.hash(data: Data(input.utf8))
        return hashed.map { String(format: "%02x", $0) }.joined()
    }
}
