import Foundation
import Testing
@testable import RhythmCore

struct ChecklistLogicTests {
    private func item(_ id: String, createdAt: String, archived: Bool = false) -> ChecklistItem {
        ChecklistItem(id: id, label: id, sortOrder: 0, archived: archived, createdAt: createdAt)
    }

    // MARK: requiredItemsForDate

    @Test func requiredItemsExcludesItemsCreatedAfterTheDate() {
        let items = [item("a", createdAt: "2026-01-01"), item("b", createdAt: "2026-02-01")]
        let required = requiredItemsForDate(items, date: "2026-01-15")
        #expect(required.map(\.id) == ["a"])
    }

    @Test func requiredItemsExcludesArchivedItemsEvenIfCreatedBeforeTheDate() {
        let items = [item("a", createdAt: "2026-01-01", archived: true)]
        #expect(requiredItemsForDate(items, date: "2026-01-15").isEmpty)
    }

    // MARK: isDateComplete

    @Test func dateWithZeroRequiredItemsIsNeverComplete() {
        #expect(isDateComplete(items: [], completedItemIds: [], date: "2026-01-01") == false)
    }

    @Test func dateIsCompleteOnlyWhenEveryRequiredItemIsChecked() {
        let items = [item("a", createdAt: "2026-01-01"), item("b", createdAt: "2026-01-01")]
        #expect(isDateComplete(items: items, completedItemIds: ["a"], date: "2026-01-02") == false)
        #expect(isDateComplete(items: items, completedItemIds: ["a", "b"], date: "2026-01-02") == true)
    }

    // MARK: calculateDayStreak

    @Test func streakCountsBackFromTodayWhenTodayIsAlreadyComplete() {
        let items = [item("a", createdAt: "2026-01-01")]
        let completions = [
            Completion(entryDate: "2026-01-03", checklistItemId: "a", completed: true),
            Completion(entryDate: "2026-01-04", checklistItemId: "a", completed: true),
            Completion(entryDate: "2026-01-05", checklistItemId: "a", completed: true),
        ]
        #expect(calculateDayStreak(items: items, completions: completions, today: "2026-01-05") == 3)
    }

    @Test func inProgressTodayDoesNotZeroTheStreak() {
        let items = [item("a", createdAt: "2026-01-01")]
        // Yesterday complete, today not yet touched.
        let completions = [
            Completion(entryDate: "2026-01-04", checklistItemId: "a", completed: true),
        ]
        #expect(calculateDayStreak(items: items, completions: completions, today: "2026-01-05") == 1)
    }

    @Test func aMissedDayResetsTheStreak() {
        let items = [item("a", createdAt: "2026-01-01")]
        let completions = [
            // 01-02 missing breaks the run back to 01-03.
            Completion(entryDate: "2026-01-01", checklistItemId: "a", completed: true),
            Completion(entryDate: "2026-01-03", checklistItemId: "a", completed: true),
            Completion(entryDate: "2026-01-04", checklistItemId: "a", completed: true),
        ]
        #expect(calculateDayStreak(items: items, completions: completions, today: "2026-01-04") == 2)
    }

    @Test func calculateWeekStreakFloorsToWholeWeeks() {
        #expect(calculateWeekStreak(dayStreak: 6) == 0)
        #expect(calculateWeekStreak(dayStreak: 7) == 1)
        #expect(calculateWeekStreak(dayStreak: 13) == 1)
        #expect(calculateWeekStreak(dayStreak: 14) == 2)
    }

    // MARK: recentCompletionHistory

    @Test func recentHistoryIsOldestFirstTodayLastWithRequestedLength() {
        let items = [item("a", createdAt: "2026-01-01")]
        let completions = [
            Completion(entryDate: "2026-01-05", checklistItemId: "a", completed: true),
        ]
        let history = recentCompletionHistory(items: items, completions: completions, today: "2026-01-05", days: 3)
        #expect(history.map(\.date) == ["2026-01-03", "2026-01-04", "2026-01-05"])
        #expect(history.map(\.complete) == [false, false, true])
    }
}
