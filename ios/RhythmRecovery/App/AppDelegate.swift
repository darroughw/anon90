import UIKit

/// Only exists to receive the two APNs registration callbacks UIKit requires an
/// `UIApplicationDelegate` for — everything else about app startup stays in
/// `RhythmRecoveryApp` (SwiftUI's own lifecycle).
final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        PushNotificationManager.didRegister(deviceToken: deviceToken)
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        PushNotificationManager.didFailToRegister(error: error)
    }
}
