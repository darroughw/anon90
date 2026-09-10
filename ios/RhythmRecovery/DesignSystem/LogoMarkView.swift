import SwiftUI

/// The app's brand mark for inline placement — a compact horizontal lockup (glyph beside
/// "Rhythm"/"Recovery") rasterized into the "DashboardWordmark" asset. Used atop the
/// Dashboard. For the full-screen splash treatment see SplashView, which uses the taller
/// stacked "WordmarkLogo" asset instead. Rendered as pre-rendered artwork rather than
/// stroking LogoGlyphShape directly — at small sizes a hairline vector stroke reads as a
/// blob, where the raster stays crisp.
struct LogoMarkView: View {
    var height: CGFloat = 40

    var body: some View {
        Image("DashboardWordmark")
            .resizable()
            .interpolation(.high)
            .scaledToFit()
            .frame(height: height)
            .accessibilityHidden(true)
    }
}
