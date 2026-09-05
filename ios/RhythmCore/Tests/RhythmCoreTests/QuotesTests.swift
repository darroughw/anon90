import Testing
@testable import RhythmCore

struct QuotesTests {
    @Test func dailyQuoteIsDeterministicForTheSameDate() {
        #expect(Quotes.daily(for: "2026-09-04") == Quotes.daily(for: "2026-09-04"))
    }

    @Test func dailyQuoteIsAlwaysOneOfTheKnownQuotes() {
        for offset in 0..<40 {
            let date = DateMath.shiftDate("2026-09-04", days: offset)
            #expect(Quotes.all.contains(Quotes.daily(for: date)))
        }
    }
}
