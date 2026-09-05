import RhythmCore
import SwiftUI

struct HelpfulLinksView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Helpful resources")
                .font(.subheadline.bold())
                .foregroundStyle(RRColor.foreground)

            ForEach(helpfulLinks, id: \.href) { link in
                if let url = URL(string: link.href) {
                    Link(destination: url) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(link.label)
                                .foregroundStyle(RRColor.foreground)
                            Text(link.description)
                                .font(.caption)
                                .foregroundStyle(RRColor.foregroundMuted)
                        }
                    }
                }
            }
        }
    }
}
