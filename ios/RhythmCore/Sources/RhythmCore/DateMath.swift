import Foundation

/// Calendar-date arithmetic on `YYYY-MM-DD` strings.
///
/// Two distinct kinds of "today" are used across the app and must not be conflated:
/// - `localToday()` — the device's local calendar day, the user's day boundary for
///   streaks/checklists (mirrors the web app's `localToday()` in DashboardClient.tsx).
/// - `shiftDate`/`daysSince`/`toUTCDays` — pure calendar-date-string math done in a fixed
///   UTC calendar so shifting a date string by N days never skips or repeats a day across
///   a DST transition (mirrors `lib/streaks.ts`'s `toUTCDays`/`shiftDate`).
public enum DateMath {
    private static let utcCalendar: Calendar = {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!
        return calendar
    }()

    /// Parses the leading `YYYY-MM-DD` of a date or timestamp string into calendar fields.
    private static func components(of dateStr: String) -> DateComponents {
        let datePart = dateStr.prefix(10)
        let parts = datePart.split(separator: "-").compactMap { Int($0) }
        precondition(parts.count == 3, "Expected a YYYY-MM-DD date string, got \(dateStr)")
        var c = DateComponents()
        c.year = parts[0]
        c.month = parts[1]
        c.day = parts[2]
        return c
    }

    private static func format(_ date: Date, in calendar: Calendar) -> String {
        let c = calendar.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04d-%02d-%02d", c.year!, c.month!, c.day!)
    }

    /// Whole days since the Unix epoch for a calendar date string, in UTC.
    static func toUTCDays(_ dateStr: String) -> Int {
        let date = utcCalendar.date(from: components(of: dateStr))!
        return Int((date.timeIntervalSince1970 / 86_400).rounded(.down))
    }

    /// Shifts a `YYYY-MM-DD` date string by `days` (negative shifts backward).
    public static func shiftDate(_ dateStr: String, days: Int) -> String {
        let date = utcCalendar.date(from: components(of: dateStr))!
        let shifted = utcCalendar.date(byAdding: .day, value: days, to: date)!
        return format(shifted, in: utcCalendar)
    }

    /// Whole calendar days between two `YYYY-MM-DD` dates, clamped to zero.
    public static func daysSince(sobrietyDate: String, today: String) -> Int {
        max(0, toUTCDays(today) - toUTCDays(sobrietyDate))
    }

    /// The device's current local calendar day as `YYYY-MM-DD` — the app's day boundary.
    public static func localToday(calendar: Calendar = .current, now: Date = Date()) -> String {
        format(now, in: calendar)
    }
}
