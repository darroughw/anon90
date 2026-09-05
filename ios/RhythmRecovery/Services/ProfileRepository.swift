import Foundation
import RhythmCore
import Supabase

struct ProfileRepository {
    private let client = SupabaseClient.shared

    /// `nil` means no `profiles` row exists yet for this user — onboarding hasn't run.
    func fetch(userId: UUID) async throws -> Profile? {
        try await client
            .from("profiles")
            .select(
                "username, sobriety_date, has_sponsor, has_service_position, has_homegroup, reminder_toast_enabled, reminder_email_enabled, marketing_emails_opt_in"
            )
            .eq("id", value: userId)
            .maybeSingle()
            .execute()
            .value
    }

    /// The onboarding-only insert shape: columns `Profile` doesn't carry (`id`, `timezone`)
    /// plus every column a user sets during the wizard.
    struct NewProfile: Encodable {
        var id: String
        var username: String
        var sobrietyDate: String
        var hasSponsor: Bool
        var hasServicePosition: Bool
        var hasHomegroup: Bool
        var timezone: String

        enum CodingKeys: String, CodingKey {
            case id, username, timezone
            case sobrietyDate = "sobriety_date"
            case hasSponsor = "has_sponsor"
            case hasServicePosition = "has_service_position"
            case hasHomegroup = "has_homegroup"
        }
    }

    func create(_ profile: NewProfile) async throws {
        try await client.from("profiles").insert(profile).execute()
    }

    /// `Profile`'s own `Codable` conformance already matches the `profiles` table's snake_case
    /// columns, so it doubles as the update body — no separate DTO needed.
    func update(userId: UUID, to profile: Profile) async throws {
        try await client
            .from("profiles")
            .update(profile)
            .eq("id", value: userId)
            .execute()
    }
}
