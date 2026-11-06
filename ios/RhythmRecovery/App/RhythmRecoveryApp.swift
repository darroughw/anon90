import Supabase
import SwiftUI

@main
struct RhythmRecoveryApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var authStore = AuthStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(authStore)
                .preferredColorScheme(.dark)
                .onOpenURL { url in
                    SupabaseClient.shared.handle(url)
                }
        }
    }
}
