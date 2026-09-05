import Foundation
import Observation
import RhythmCore

@Observable
@MainActor
final class JournalHistoryViewModel {
    let userId: UUID
    private(set) var entries: [JournalEntry] = []
    private(set) var loading = true
    var errorMessage: String?

    private let repository = JournalRepository()

    init(userId: UUID) {
        self.userId = userId
    }

    func load() async {
        loading = true
        errorMessage = nil
        do {
            entries = try await repository.fetchAllNonEmpty(userId: userId)
        } catch {
            errorMessage = "Couldn't load your notes."
        }
        loading = false
    }
}
