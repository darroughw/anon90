import Testing
@testable import RhythmCore

struct JournalTests {
    @Test func candidateDatesAreSpacedThirtyDaysApartNearestFirst() {
        let dates = anniversaryCandidateDates(today: "2026-09-04", cap: 3)
        #expect(dates.count == 3)
        #expect(dates[0] == DateMath.shiftDate("2026-09-04", days: -30))
        for i in 0..<(dates.count - 1) {
            #expect(DateMath.daysSince(sobrietyDate: dates[i + 1], today: dates[i]) == 30)
        }
    }

    @Test func candidateDatesIsEmptyForNonPositiveCap() {
        #expect(anniversaryCandidateDates(today: "2026-09-04", cap: 0).isEmpty)
    }

    @Test func matchAnniversariesSurfacesAnEntryExactlyThirtyDaysAgo() {
        let today = "2026-09-04"
        let thirtyDaysAgo = DateMath.shiftDate(today, days: -30)
        let entries = [JournalEntry(entryDate: thirtyDaysAgo, journal: "Called my sponsor today.")]

        let matches = matchAnniversaries(entries: entries, today: today)

        #expect(matches.count == 1)
        #expect(matches[0].monthsAgo == 1)
        #expect(matches[0].journal == "Called my sponsor today.")
    }

    @Test func matchAnniversariesExcludesEntriesWithBlankJournalText() {
        let today = "2026-09-04"
        let thirtyDaysAgo = DateMath.shiftDate(today, days: -30)
        let entries = [JournalEntry(entryDate: thirtyDaysAgo, journal: "   ")]

        #expect(matchAnniversaries(entries: entries, today: today).isEmpty)
    }

    @Test func matchAnniversariesExcludesEntriesNotOnACandidateDate() {
        let today = "2026-09-04"
        let entries = [JournalEntry(entryDate: DateMath.shiftDate(today, days: -31), journal: "Off by one day.")]

        #expect(matchAnniversaries(entries: entries, today: today).isEmpty)
    }

    @Test func matchAnniversariesSortsMultipleMatchesNearestFirst() {
        let today = "2026-09-04"
        let entries = [
            JournalEntry(entryDate: DateMath.shiftDate(today, days: -60), journal: "Two months ago."),
            JournalEntry(entryDate: DateMath.shiftDate(today, days: -30), journal: "One month ago."),
        ]

        let matches = matchAnniversaries(entries: entries, today: today)

        #expect(matches.map(\.monthsAgo) == [1, 2])
    }
}
