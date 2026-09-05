import Foundation
import Observation
import RhythmCore

@Observable
@MainActor
final class DashboardViewModel {
    let userId: UUID
    var profile: Profile

    private(set) var items: [ChecklistItem] = []
    private(set) var completions: [Completion] = []
    private(set) var anniversaries: [JournalAnniversary] = []
    var journalText = ""
    var journalStatus = ""
    private(set) var loading = true
    var errorMessage: String?
    /// The local calendar day this dashboard is showing. Compared against a fresh
    /// `DateMath.localToday()` on a timer so a session left open across midnight reloads
    /// instead of silently showing yesterday's list, mirroring the web's 60s poll.
    private(set) var today: String

    /// Flips the instant today's checklist newly becomes complete (not when it loads in
    /// already-complete) so a celebratory animation can play exactly once per completion.
    private(set) var justCompletedDay = false
    private var trackedComplete: Bool?

    private let checklistRepository = ChecklistRepository()
    private let journalRepository = JournalRepository()

    init(userId: UUID, profile: Profile) {
        self.userId = userId
        self.profile = profile
        today = DateMath.localToday()
    }

    func load() async {
        loading = true
        errorMessage = nil

        let since = DateMath.shiftDate(today, days: -60)
        let candidateDates = anniversaryCandidateDates(today: today)

        do {
            async let itemsResult = checklistRepository.fetchActive()
            async let completionsResult = checklistRepository.fetchCompletions(since: since)
            async let journalResult = journalRepository.fetchEntry(date: today)
            async let anniversaryEntriesResult = journalRepository.fetchEntries(on: candidateDates)

            let (fetchedItems, fetchedCompletions, journalEntry, anniversaryEntries) =
                try await (itemsResult, completionsResult, journalResult, anniversaryEntriesResult)

            items = fetchedItems
            completions = fetchedCompletions
            journalText = journalEntry?.journal ?? ""
            anniversaries = matchAnniversaries(entries: anniversaryEntries, today: today)
            updateCompletionTracking()
        } catch {
            errorMessage = "Couldn't load today's checklist. Try refreshing."
        }

        loading = false
        await syncNotifications()
    }

    func syncNotifications() async {
        await NotificationScheduler.sync(enabled: profile.reminderToastEnabled, dayIncomplete: !dayComplete)
    }

    /// Call periodically (e.g. from a 60s timer) — reloads everything when the device's
    /// local calendar day has rolled over since this dashboard was loaded.
    func checkDayRollover() async {
        let now = DateMath.localToday()
        guard now != today else { return }
        today = now
        await load()
    }

    private func updateCompletionTracking() {
        let complete = dayComplete
        if let previous = trackedComplete, !previous, complete {
            justCompletedDay = true
        }
        trackedComplete = complete
    }

    func clearJustCompletedDay() {
        justCompletedDay = false
    }

    func toggleItem(_ itemId: String) async {
        let completed = !todayCompletedItemIds.contains(itemId)

        completions.removeAll { $0.entryDate == today && $0.checklistItemId == itemId }
        completions.append(Completion(entryDate: today, checklistItemId: itemId, completed: completed))
        updateCompletionTracking()

        do {
            try await checklistRepository.setCompletion(userId: userId, date: today, itemId: itemId, completed: completed)
        } catch {
            errorMessage = "Couldn't save that. Try again."
        }

        await syncNotifications()
    }

    func saveJournal() async {
        journalStatus = "Saving..."
        do {
            try await journalRepository.save(userId: userId, date: today, journal: journalText)
            journalStatus = "Saved"
        } catch {
            journalStatus = "Couldn't save."
        }
    }

    func reloadChecklistItems() async {
        do {
            items = try await checklistRepository.fetchActive()
        } catch {
            errorMessage = "Couldn't load your checklist. Try reopening this dialog."
        }
    }

    // MARK: Derived state

    var todayCompletedItemIds: Set<String> {
        Set(completions.filter { $0.entryDate == today && $0.completed }.map(\.checklistItemId))
    }

    var requiredToday: [ChecklistItem] {
        requiredItemsForDate(items, date: today)
    }

    var completedTodayCount: Int {
        requiredToday.filter { todayCompletedItemIds.contains($0.id) }.count
    }

    var dayComplete: Bool {
        isDateComplete(items: items, completedItemIds: todayCompletedItemIds, date: today)
    }

    var dayStreak: Int {
        calculateDayStreak(items: items, completions: completions, today: today)
    }

    var weekStreak: Int {
        calculateWeekStreak(dayStreak: dayStreak)
    }

    var daysSober: Int {
        DateMath.daysSince(sobrietyDate: profile.sobrietyDate, today: today)
    }

    var nextMilestone: Milestone {
        getNextMilestone(daysSober: daysSober)
    }

    var milestoneProgressPercent: Double {
        milestoneProgress(daysSober: daysSober, milestone: nextMilestone)
    }

    var earnedMilestones: [Milestone] {
        getEarnedMilestones(daysSober: daysSober)
    }

    var dailyQuote: String {
        Quotes.daily(for: today)
    }

    func recentHistory(days: Int) -> [DayStatus] {
        recentCompletionHistory(items: items, completions: completions, today: today, days: days)
    }
}
