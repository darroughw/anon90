import Foundation

/// A day's completion status, oldest-relevant-history-first when produced by
/// ``recentCompletionHistory(items:completions:today:days:)``.
public struct DayStatus: Equatable, Sendable {
    public let date: String
    public let complete: Bool

    public init(date: String, complete: Bool) {
        self.date = date
        self.complete = complete
    }
}

/// Items that actually applied on a given date: existed by then, not archived.
/// Mirrors `lib/streaks.ts`'s `requiredItemsForDate`.
public func requiredItemsForDate(_ items: [ChecklistItem], date: String) -> [ChecklistItem] {
    items.filter { !$0.archived && String($0.createdAt.prefix(10)) <= date }
}

/// A day counts complete only if every item that applied *on that date* was checked.
/// Items added later don't retroactively break old streaks; archived items stop counting
/// for every date, past included. A day with zero required items is never complete.
public func isDateComplete(
    items: [ChecklistItem],
    completedItemIds: Set<String>,
    date: String
) -> Bool {
    let required = requiredItemsForDate(items, date: date)
    if required.isEmpty { return false }
    return required.allSatisfy { completedItemIds.contains($0.id) }
}

private func groupCompletedIdsByDate(_ completions: [Completion]) -> [String: Set<String>] {
    var byDate: [String: Set<String>] = [:]
    for completion in completions where completion.completed {
        byDate[completion.entryDate, default: []].insert(completion.checklistItemId)
    }
    return byDate
}

/// Consecutive complete days ending today (if today is already complete) or yesterday
/// (so an in-progress day doesn't prematurely zero the streak).
public func calculateDayStreak(
    items: [ChecklistItem],
    completions: [Completion],
    today: String
) -> Int {
    let completedByDate = groupCompletedIdsByDate(completions)
    func dateComplete(_ date: String) -> Bool {
        isDateComplete(items: items, completedItemIds: completedByDate[date] ?? [], date: date)
    }

    var cursor = dateComplete(today) ? today : DateMath.shiftDate(today, days: -1)
    var streak = 0

    while dateComplete(cursor) {
        streak += 1
        cursor = DateMath.shiftDate(cursor, days: -1)
    }

    return streak
}

/// First pass: whole completed 7-day blocks within the current day streak.
public func calculateWeekStreak(dayStreak: Int) -> Int {
    dayStreak / 7
}

/// Completion status for the last `days` days, oldest first, today last.
public func recentCompletionHistory(
    items: [ChecklistItem],
    completions: [Completion],
    today: String,
    days: Int
) -> [DayStatus] {
    let completedByDate = groupCompletedIdsByDate(completions)
    var history: [DayStatus] = []

    for i in stride(from: days - 1, through: 0, by: -1) {
        let date = DateMath.shiftDate(today, days: -i)
        let complete = isDateComplete(items: items, completedItemIds: completedByDate[date] ?? [], date: date)
        history.append(DayStatus(date: date, complete: complete))
    }

    return history
}
