import Foundation
import Testing
@testable import RhythmCore

struct DateMathTests {
    @Test func shiftDateForward() {
        #expect(DateMath.shiftDate("2026-01-01", days: 1) == "2026-01-02")
    }

    @Test func shiftDateBackward() {
        #expect(DateMath.shiftDate("2026-01-01", days: -1) == "2025-12-31")
    }

    @Test func shiftDateAcrossLeapDay() {
        #expect(DateMath.shiftDate("2024-02-28", days: 1) == "2024-02-29")
        #expect(DateMath.shiftDate("2024-03-01", days: -1) == "2024-02-29")
    }

    @Test func shiftDateAcrossNonLeapYearEnd() {
        #expect(DateMath.shiftDate("2025-02-28", days: 1) == "2025-03-01")
    }

    @Test func shiftDateLargeSpan() {
        #expect(DateMath.shiftDate("2026-09-04", days: -30) == "2026-08-05")
    }

    @Test func daysSinceSameDate() {
        #expect(DateMath.daysSince(sobrietyDate: "2026-01-01", today: "2026-01-01") == 0)
    }

    @Test func daysSinceElapsed() {
        #expect(DateMath.daysSince(sobrietyDate: "2026-01-01", today: "2026-04-01") == 90)
    }

    @Test func daysSinceClampsToZeroWhenSobrietyDateIsInTheFuture() {
        #expect(DateMath.daysSince(sobrietyDate: "2026-06-01", today: "2026-01-01") == 0)
    }

    @Test func localTodayFormatsExplicitDateInGivenCalendar() {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "America/Los_Angeles")!
        let components = DateComponents(year: 2026, month: 9, day: 4, hour: 23, minute: 30)
        let date = calendar.date(from: components)!
        #expect(DateMath.localToday(calendar: calendar, now: date) == "2026-09-04")
    }
}
