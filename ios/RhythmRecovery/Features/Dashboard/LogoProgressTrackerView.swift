import SwiftUI

/// Draws-in the wordmark glyph as checklist items are completed — the iOS counterpart to
/// components/dashboard/DailyProgressBar.tsx on the web. Two stacked copies of the same
/// path: a dim static track, and a bright fill revealed via `.trim`.
struct LogoProgressTrackerView: View {
    let completed: Int
    let total: Int

    private var fraction: Double {
        guard total > 0 else { return 0 }
        return min(1, Double(completed) / Double(total))
    }

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                LogoGlyphShape()
                    .stroke(RRColor.border, style: StrokeStyle(lineWidth: 6, lineCap: .round, lineJoin: .round))

                LogoGlyphShape()
                    .trim(from: 0, to: fraction)
                    .stroke(RRColor.foreground, style: StrokeStyle(lineWidth: 6, lineCap: .round, lineJoin: .round))
                    .shadow(color: RRColor.foreground.opacity(0.65), radius: 6)
            }
            .aspectRatio(LogoGlyph.viewBox.width / LogoGlyph.viewBox.height, contentMode: .fit)
            .frame(maxWidth: 260)
            .animation(.easeOut(duration: 0.7), value: fraction)
            .accessibilityLabel("\(completed) of \(total) tasks complete today")

            Text("\(completed) of \(total) today")
                .font(.footnote)
                .foregroundStyle(RRColor.foregroundMuted)
        }
        .frame(maxWidth: .infinity)
    }
}
