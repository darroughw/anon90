import Foundation

/// A journal entry that lands on a 30-day anniversary of when it was written.
public struct JournalAnniversary: Equatable, Sendable {
    public let entryDate: String
    public let journal: String
    public let monthsAgo: Int

    public init(entryDate: String, journal: String, monthsAgo: Int) {
        self.entryDate = entryDate
        self.journal = journal
        self.monthsAgo = monthsAgo
    }
}

private let anniversaryIntervalDays = 30
/// How far back to look for anniversaries -- 36 * 30 days is 3 years.
public let maxAnniversariesBack = 36

/// Every date exactly N*30 days before today, N = 1..cap, nearest first.
public func anniversaryCandidateDates(today: String, cap: Int = maxAnniversariesBack) -> [String] {
    guard cap >= 1 else { return [] }
    return (1...cap).map { n in DateMath.shiftDate(today, days: -anniversaryIntervalDays * n) }
}

/// Entries that were written exactly N*30 days ago -- a note surfaces as a "1 month ago
/// today" echo on day 30 after it was written, "2 months ago today" on day 60, and so on.
/// A prolific journaler can hit more than one of these on the same day; all of them
/// surface, nearest first.
public func matchAnniversaries(
    entries: [JournalEntry],
    today: String,
    cap: Int = maxAnniversariesBack
) -> [JournalAnniversary] {
    var monthsAgoByDate: [String: Int] = [:]
    for (index, date) in anniversaryCandidateDates(today: today, cap: cap).enumerated() {
        monthsAgoByDate[date] = index + 1
    }

    return entries
        .filter { entry in
            !entry.journal.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                && monthsAgoByDate[entry.entryDate] != nil
        }
        .map { entry in
            JournalAnniversary(entryDate: entry.entryDate, journal: entry.journal, monthsAgo: monthsAgoByDate[entry.entryDate]!)
        }
        .sorted { $0.monthsAgo < $1.monthsAgo }
}
