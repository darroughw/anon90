import Foundation
import Observation
import Supabase

@Observable
@MainActor
final class AuthViewModel {
    var email = ""
    var password = ""
    var errorMessage: String?
    var isSubmitting = false
    /// Set on sign-up when the response carried no session — email confirmation is pending,
    /// mirroring the web's `SignUpForm`'s "check your email" state.
    var awaitingEmailConfirmation = false
    /// Set once a password-reset email has been requested.
    var passwordResetSent = false

    /// The app has no native "set new password" screen (that would need universal-links
    /// handling for the recovery redirect); the reset link instead completes on the web,
    /// reusing the existing `/auth/callback` route to exchange the code before landing on
    /// `/reset-password`. The user finishes there and logs back into the app with the new
    /// password.
    private static let passwordResetRedirectURL = URL(string: "https://rhythmrecovery.app/auth/callback?next=/reset-password")!

    func signIn() async {
        errorMessage = nil
        isSubmitting = true
        defer { isSubmitting = false }

        do {
            _ = try await SupabaseClient.shared.auth.signIn(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signUp() async {
        errorMessage = nil
        isSubmitting = true
        defer { isSubmitting = false }

        do {
            let response = try await SupabaseClient.shared.auth.signUp(email: email, password: password)
            awaitingEmailConfirmation = response.session == nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func sendPasswordReset() async {
        errorMessage = nil
        isSubmitting = true
        defer { isSubmitting = false }

        do {
            try await SupabaseClient.shared.auth.resetPasswordForEmail(email, redirectTo: Self.passwordResetRedirectURL)
            // Supabase never reveals whether the email is registered here (avoids account
            // enumeration), so the UI shows the same "sent" state regardless.
            passwordResetSent = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signInWithApple(idToken: String, nonce: String) async {
        errorMessage = nil
        isSubmitting = true
        defer { isSubmitting = false }

        do {
            _ = try await SupabaseClient.shared.auth.signInWithIdToken(
                credentials: OpenIDConnectCredentials(provider: .apple, idToken: idToken, nonce: nonce)
            )
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
