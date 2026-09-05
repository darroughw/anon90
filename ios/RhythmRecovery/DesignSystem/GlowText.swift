import SwiftUI

/// The app's one recurring flourish: a faint white glow on headline numbers and milestone
/// badges. Used sparingly per docs/mvp-scope.md — restraint over spectacle, not a generic
/// "make it shiny" effect, so it isn't applied to body text or every heading.
private struct Glow: ViewModifier {
    var radius: CGFloat
    var opacity: Double

    func body(content: Content) -> some View {
        content
            .foregroundStyle(RRColor.foreground)
            .shadow(color: RRColor.foreground.opacity(opacity), radius: radius)
    }
}

extension View {
    func glow(radius: CGFloat = 6, opacity: Double = 0.35) -> some View {
        modifier(Glow(radius: radius, opacity: opacity))
    }
}
