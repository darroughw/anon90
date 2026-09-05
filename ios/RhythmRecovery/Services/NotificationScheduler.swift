import Foundation
import UserNotifications

/// Local-only reminder replacing the web's after-9pm in-app toast. Scheduled fresh each day
/// (not a repeating trigger) so it only exists when today's checklist is actually incomplete
/// at schedule time, and is cancelled the moment the day is completed — recomputed from the
/// same day-rollover/completion-change events the dashboard already reacts to.
@MainActor
enum NotificationScheduler {
    private static let identifier = "daily-checklist-reminder"
    private static let reminderHour = 21

    /// Reconciles the pending notification with current state. Call after every load,
    /// checklist toggle, day rollover, and reminder-preference change.
    static func sync(enabled: Bool, dayIncomplete: Bool) async {
        let center = UNUserNotificationCenter.current()

        guard enabled, dayIncomplete else {
            center.removePendingNotificationRequests(withIdentifiers: [identifier])
            return
        }

        guard await isAuthorized(center: center) else { return }

        var dateComponents = DateComponents()
        dateComponents.hour = reminderHour
        dateComponents.minute = 0
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: false)

        let content = UNMutableNotificationContent()
        content.title = "Rhythm Recovery"
        content.body = "It's later in the day. A few tasks are still open on today's list."
        content.sound = .default

        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

        center.removePendingNotificationRequests(withIdentifiers: [identifier])
        try? await center.add(request)
    }

    static func cancel() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier])
    }

    /// Requests permission the first time this is reached — i.e. the first time the user
    /// turns the reminder toggle on with something to remind about, not at cold launch.
    private static func isAuthorized(center: UNUserNotificationCenter) async -> Bool {
        let settings = await center.notificationSettings()
        switch settings.authorizationStatus {
        case .authorized, .provisional, .ephemeral:
            return true
        case .notDetermined:
            return (try? await center.requestAuthorization(options: [.alert, .sound])) ?? false
        case .denied:
            return false
        @unknown default:
            return false
        }
    }
}
