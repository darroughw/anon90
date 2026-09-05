import RhythmCore
import SwiftUI

struct MilestoneSectionView: View {
    let nextMilestone: Milestone
    let progressPercent: Double
    let earnedMilestones: [Milestone]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Next: \(nextMilestone.label)")
                    .font(.subheadline)
                    .foregroundStyle(RRColor.foregroundMuted)
                Spacer()
                Text("\(Int(progressPercent.rounded()))%")
                    .font(.caption.bold())
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(RRColor.foreground.opacity(0.12))
                    .foregroundStyle(RRColor.foreground)
                    .clipShape(Capsule())
            }

            ProgressView(value: progressPercent, total: 100)
                .tint(RRColor.foreground)

            if !earnedMilestones.isEmpty {
                Text("Milestones reached")
                    .font(.subheadline.bold())
                    .foregroundStyle(RRColor.foreground)
                    .padding(.top, 4)

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 90), spacing: 8)], alignment: .leading, spacing: 8) {
                    ForEach(earnedMilestones, id: \.days) { milestone in
                        Text(milestone.label)
                            .font(.caption.bold())
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(RRColor.foreground.opacity(0.1))
                            .foregroundStyle(RRColor.foreground)
                            .clipShape(Capsule())
                            .glow(radius: 3, opacity: 0.25)
                    }
                }
            }
        }
    }
}
