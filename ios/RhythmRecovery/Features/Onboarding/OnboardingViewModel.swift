import Foundation
import Observation
import RhythmCore

@Observable
@MainActor
final class OnboardingViewModel {
    var username: String
    var sobrietyDate = Date()
    var hasSponsor = false
    var hasServicePosition = false
    var hasHomegroup = false
    var errorMessage: String?
    var isSubmitting = false

    private let profileRepository = ProfileRepository()
    private let checklistRepository = ChecklistRepository()

    init() {
        username = generateUsername()
    }

    func finish(userId: UUID) async -> Bool {
        errorMessage = nil
        isSubmitting = true
        defer { isSubmitting = false }

        let trimmedUsername = username.trimmingCharacters(in: .whitespacesAndNewlines)

        do {
            let newProfile = ProfileRepository.NewProfile(
                id: userId.uuidString,
                username: trimmedUsername,
                sobrietyDate: DateMath.localToday(now: sobrietyDate),
                hasSponsor: hasSponsor,
                hasServicePosition: hasServicePosition,
                hasHomegroup: hasHomegroup,
                timezone: TimeZone.current.identifier
            )
            try await profileRepository.create(newProfile)
            try await checklistRepository.seedDefaults(userId: userId)
            return true
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
    }
}
