import RhythmCore
import SwiftUI

struct JournalEchoView: View {
    let anniversaries: [JournalAnniversary]

    var body: some View {
        if !anniversaries.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                ForEach(anniversaries, id: \.entryDate) { entry in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(monthsLabel(entry.monthsAgo))
                            .font(.caption)
                            .foregroundStyle(RRColor.foregroundMuted)
                        Text("\u{201C}\(entry.journal)\u{201D}")
                            .italic()
                            .foregroundStyle(RRColor.foreground)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RRColor.foreground.opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
            }
        }
    }

    private func monthsLabel(_ monthsAgo: Int) -> String {
        monthsAgo == 1 ? "1 month ago today" : "\(monthsAgo) months ago today"
    }
}
