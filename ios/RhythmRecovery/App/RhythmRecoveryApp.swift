import Supabase
import SwiftUI

@main
struct RhythmRecoveryApp: App {
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
