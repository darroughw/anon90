import RhythmCore
import SwiftUI

/// Streak numbers plus a 7/10/30-day history strip — the visual echo of the wordmark's
/// waveform. Only fill color encodes complete vs. missed; the height variation among
/// complete days is purely decorative.
struct RhythmBarStripView: View {
    let dayStreak: Int
    let weekStreak: Int
    let history: (Int) -> [DayStatus]

    @AppStorage("rhythm-recovery.rhythmRange") private var range = 7

    private static let rangeOptions = [7, 10, 30]
    private static let onHeights: [CGFloat] = [38, 52, 44, 60, 48, 56, 42]
    private static let offHeight: CGFloat = 14

    var body: some View {
        let days = history(range)

        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                HStack(spacing: 24) {
                    stat(value: dayStreak, label: "Day streak")
                    stat(value: weekStreak, label: "Week streak")
                }
                Spacer()
                HStack(spacing: 6) {
                    ForEach(Self.rangeOptions, id: \.self) { option in
                        Button("\(option)d") { range = option }
                            .font(.caption.bold())
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(range == option ? RRColor.foreground.opacity(0.18) : Color.clear)
                            .foregroundStyle(range == option ? RRColor.foreground : RRColor.foregroundMuted)
                            .clipShape(Capsule())
                    }
                }
            }

            HStack(alignment: .bottom, spacing: 3) {
                ForEach(Array(days.enumerated()), id: \.offset) { index, day in
                    RoundedRectangle(cornerRadius: 2, style: .continuous)
                        .fill(day.complete ? RRColor.foreground : RRColor.foreground.opacity(0.15))
                        .frame(height: day.complete ? Self.onHeights[index % Self.onHeights.count] : Self.offHeight)
                        .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 60, alignment: .bottom)

            HStack {
                Text("\(range) days ago")
                Spacer()
                Text("Today")
            }
            .font(.caption2)
            .foregroundStyle(RRColor.foregroundMuted)
        }
        .padding(16)
        .background(RRColor.foreground.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private func stat(value: Int, label: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("\(value)")
                .font(.title.bold())
                .glow()
            Text(label)
                .font(.caption)
                .foregroundStyle(RRColor.foregroundMuted)
        }
    }
}
