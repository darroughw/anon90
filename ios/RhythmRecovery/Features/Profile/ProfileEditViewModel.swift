import Foundation
import Observation
import RhythmCore
import Supabase

@Observable
@MainActor
final class ProfileEditViewModel {
    let userId: UUID
    var username: String
    var sobrietyDate: Date
    var hasSponsor: Bool
    var hasServicePosition: Bool
    var hasHomegroup: Bool
    var reminderToastEnabled: Bool
    var reminderEmailEnabled: Bool
    var marketingEmailsOptIn: Bool

    var errorMessage: String?
    var isSubmitting = false
    var confirmingDelete = false
    var isDeleting = false
    var deleteErrorMessage: String?

    /// Called after a successful save with the updated profile, so the dashboard can adopt it
    /// without a full reload.
    var onSaved: (Profile) -> Void = { _ in }

    private let repository = ProfileRepository()

    init(userId: UUID, profile: Profile) {
        self.userId = userId
        username = profile.username
        sobrietyDate = ProfileEditViewModel.date(from: profile.sobrietyDate)
        hasSponsor = profile.hasSponsor
        hasServicePosition = profile.hasServicePosition
        hasHomegroup = profile.hasHomegroup
        reminderToastEnabled = profile.reminderToastEnabled
        reminderEmailEnabled = profile.reminderEmailEnabled
        marketingEmailsOptIn = profile.marketingEmailsOptIn
    }

    private static func date(from isoDate: String) -> Date {
        let parts = isoDate.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3 else { return Date() }
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = .current
        return calendar.date(from: DateComponents(year: parts[0], month: parts[1], day: parts[2])) ?? Date()
    }

    func save() async -> Bool {
        errorMessage = nil

        let trimmedUsername = username.trimmingCharacters(in: .whitespacesAndNewlines)
        guard (3...24).contains(trimmedUsername.count) else {
            errorMessage = "Display name must be 3-24 characters."
            return false
        }

        isSubmitting = true
        defer { isSubmitting = false }

        let profile = Profile(
            username: trimmedUsername,
            sobrietyDate: DateMath.localToday(now: sobrietyDate),
            hasSponsor: hasSponsor,
            hasServicePosition: hasServicePosition,
            hasHomegroup: hasHomegroup,
            reminderToastEnabled: reminderToastEnabled,
            reminderEmailEnabled: reminderEmailEnabled,
            marketingEmailsOptIn: marketingEmailsOptIn
        )

        do {
            try await repository.update(userId: userId, to: profile)
            onSaved(profile)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }

    /// Deletion has to go through a server-side Edge Function — a service-role key that can
    /// delete an `auth.users` row must never ship inside the app binary. See
    /// `supabase/functions/delete-account`.
    func deleteAccount() async -> Bool {
        deleteErrorMessage = nil
        isDeleting = true
        defer { isDeleting = false }

        do {
            try await SupabaseClient.shared.functions.invoke("delete-account")
            return true
        } catch {
            deleteErrorMessage = error.localizedDescription
            return false
        }
    }
}
