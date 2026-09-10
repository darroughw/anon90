import SwiftUI

/// Brand splash shown over RootView while the initial auth session resolves. The OS launch
/// screen (LaunchScreen.storyboard) only paints the matching background color — this view
/// takes over immediately after for the actual logo, since it's plain SwiftUI and doesn't
/// depend on Interface Builder resolving an image asset at launch time. Dismissed with a
/// quick fade + scale as soon as loading finishes, not held open artificially.
struct SplashView: View {
    var body: some View {
        RRColor.background
            .ignoresSafeArea()
            .overlay {
                Image("WordmarkLogo")
                    .resizable()
                    .interpolation(.high)
                    .scaledToFit()
                    .frame(maxWidth: 240)
                    .padding(40)
            }
    }
}
