import Foundation
import Supabase
import UIKit
import UserNotifications

/// Bridges APNs device-token registration to `device_tokens`. Unlike `NotificationScheduler`
/// (local-only, scheduled on-device), this feeds a server-sent push — see
/// `app/api/cron/reminders/route.ts` and `lib/apns.ts`.
@MainActor
enum PushNotificationManager {
    private static let repository = DeviceTokenRepository()
    private(set) static var deviceToken: String?

    /// Call after every profile load and whenever the push-reminder toggle turns on (same
    /// timing as `NotificationScheduler.sync`) — requests authorization the first time, then
    /// asks iOS to (re)register for a device token and upserts it once one's available.
    static func sync(enabled: Bool) async {
        guard enabled else { return }
        guard await isAuthorized() else { return }

        UIApplication.shared.registerForRemoteNotifications()

        if let deviceToken {
            await registerWithServer(token: deviceToken)
        }
    }

    /// Forwarded from `AppDelegate.application(_:didRegisterForRemoteNotificationsWithDeviceToken:)`.
    static func didRegister(deviceToken tokenData: Data) {
        let token = tokenData.map { String(format: "%02x", $0) }.joined()
        deviceToken = token
        Task { await registerWithServer(token: token) }
    }

    /// Forwarded from `AppDelegate.application(_:didFailToRegisterForRemoteNotificationsWithError:)`.
    static func didFailToRegister(error: Error) {
        print("[push] registration failed:", error.localizedDescription)
    }

    /// Best-effort — call on sign-out so a signed-out device stops being a valid push target
    /// for the account it was registered against.
    static func unregisterCurrentToken(userId: UUID) async {
        guard let deviceToken else { return }
        try? await repository.unregister(userId: userId, token: deviceToken)
    }

    private static func registerWithServer(token: String) async {
        guard let userId = SupabaseClient.shared.auth.currentSession?.user.id else { return }
        try? await repository.register(userId: userId, token: token)
    }

    private static func isAuthorized() async -> Bool {
        let center = UNUserNotificationCenter.current()
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
