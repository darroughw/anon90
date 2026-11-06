import Foundation
import Supabase

/// Mirrors `device_tokens`. RLS restricts rows to `auth.uid() = user_id`, so this only ever
/// touches the signed-in user's own tokens.
struct DeviceTokenRepository {
    private let client = SupabaseClient.shared

    private struct Row: Encodable {
        let userId: UUID
        let token: String
        let platform = "ios"

        enum CodingKeys: String, CodingKey {
            case userId = "user_id"
            case token
            case platform
        }
    }

    /// Upserts on the `(user_id, token)` unique constraint — safe to call on every launch/
    /// registration callback, not just the first one.
    func register(userId: UUID, token: String) async throws {
        try await client
            .from("device_tokens")
            .upsert(Row(userId: userId, token: token), onConflict: "user_id,token")
            .execute()
    }

    /// Best-effort cleanup on sign-out so a device that's no longer signed in doesn't keep
    /// getting pushes for whoever's account it's holding a stale token for.
    func unregister(userId: UUID, token: String) async throws {
        try await client
            .from("device_tokens")
            .delete()
            .eq("user_id", value: userId)
            .eq("token", value: token)
            .execute()
    }
}
