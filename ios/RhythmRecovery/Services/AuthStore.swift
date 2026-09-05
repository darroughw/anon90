import Foundation
import Observation
import Supabase

/// App-wide source of truth for "who is signed in", fed by `auth.authStateChanges`.
///
/// Mirrors the web app's pattern of reading `getClaims().claims.sub` for the user id, but
/// caches it from the already-verified local session instead of re-verifying on every read —
/// `getClaims()` (a full JWT/JWKS re-check) is reserved for one-off sensitive-write checks,
/// not constant SwiftUI reads.
@Observable
@MainActor
final class AuthStore {
    private(set) var userId: UUID?
    /// `false` until the first `authStateChanges` event lands (always `.initialSession`,
    /// per the SDK's contract) — lets the root view show a loading state instead of
    /// flashing the logged-out UI before the persisted session has been checked.
    private(set) var hasResolvedInitialSession = false

    init() {
        Task {
            for await (_, session) in SupabaseClient.shared.auth.authStateChanges {
                apply(session: session)
            }
        }
    }

    private func apply(session: Session?) {
        userId = session?.user.id
        hasResolvedInitialSession = true
    }

    func signOut() async {
        NotificationScheduler.cancel()
        try? await SupabaseClient.shared.auth.signOut()
    }
}
