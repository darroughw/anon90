import RhythmCore
import SwiftUI

struct RootView: View {
    @Environment(AuthStore.self) private var authStore

    var body: some View {
        Group {
            if !authStore.hasResolvedInitialSession {
                LoadingView()
            } else if let userId = authStore.userId {
                SignedInRouterView(userId: userId)
            } else {
                AuthFlowView()
            }
        }
    }
}

private struct LoadingView: View {
    var body: some View {
        ProgressView()
            .tint(RRColor.foreground)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(RRColor.background.ignoresSafeArea())
    }
}

/// Fetches the current user's `profiles` row (once) and routes to Onboarding if none exists
/// yet, or the Dashboard if it does — mirroring the web's `OnboardingPage`/`DashboardPage`
/// server-side redirect logic.
private struct SignedInRouterView: View {
    let userId: UUID

    private enum LoadState {
        case loading
        case needsOnboarding
        case ready(Profile)
        case failed(String)
    }

    @State private var state: LoadState = .loading
    private let profileRepository = ProfileRepository()

    var body: some View {
        Group {
            switch state {
            case .loading:
                LoadingView()
            case .needsOnboarding:
                OnboardingWizardView(userId: userId) {
                    Task { await load() }
                }
            case .ready(let profile):
                DashboardView(viewModel: DashboardViewModel(userId: userId, profile: profile))
            case .failed(let message):
                VStack(spacing: 16) {
                    ErrorBanner(message: message)
                    Button("Try again") { Task { await load() } }
                        .buttonStyle(RRSecondaryButtonStyle())
                }
                .padding(24)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(RRColor.background.ignoresSafeArea())
            }
        }
        .task { await load() }
    }

    private func load() async {
        state = .loading
        do {
            if let profile = try await profileRepository.fetch(userId: userId) {
                state = .ready(profile)
            } else {
                state = .needsOnboarding
            }
        } catch {
            state = .failed(error.localizedDescription)
        }
    }
}
