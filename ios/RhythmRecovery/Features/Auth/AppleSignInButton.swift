import AuthenticationServices
import SwiftUI

/// Wraps `SignInWithAppleButton` with the nonce plumbing both Login and Signup need —
/// see `AppleSignInNonce` for why a raw/hashed nonce pair is generated per attempt.
struct AppleSignInButton: View {
    var viewModel: AuthViewModel
    @State private var currentNonce: String?

    var body: some View {
        SignInWithAppleButton(.signIn) { request in
            let nonce = AppleSignInNonce.random()
            currentNonce = nonce
            request.requestedScopes = [.email]
            request.nonce = AppleSignInNonce.sha256(nonce)
        } onCompletion: { result in
            handle(result)
        }
        .signInWithAppleButtonStyle(.white)
        .frame(height: 50)
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }

    private func handle(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            guard
                let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
                let identityToken = credential.identityToken,
                let idTokenString = String(data: identityToken, encoding: .utf8),
                let nonce = currentNonce
            else {
                viewModel.errorMessage = "Apple sign-in didn't return a usable credential."
                return
            }
            Task { await viewModel.signInWithApple(idToken: idTokenString, nonce: nonce) }
        case .failure(let error):
            let nsError = error as NSError
            // The user dismissing the Apple sheet surfaces as .canceled -- not a real
            // failure, so it shouldn't paint an error banner.
            if nsError.domain == ASAuthorizationError.errorDomain,
               nsError.code == ASAuthorizationError.canceled.rawValue {
                return
            }
            viewModel.errorMessage = error.localizedDescription
        }
    }
}
