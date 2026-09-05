import SwiftUI

struct JournalHistoryView: View {
    @State var viewModel: JournalHistoryViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Your notes")
                    .font(.title2.bold())
                    .foregroundStyle(RRColor.foreground)
                Text("Everything you've written to your future self, newest first.")
                    .font(.subheadline)
                    .foregroundStyle(RRColor.foregroundMuted)

                if let error = viewModel.errorMessage {
                    ErrorBanner(message: error)
                }

                if viewModel.loading {
                    ProgressView().tint(RRColor.foreground)
                } else if viewModel.entries.isEmpty {
                    Text("Nothing here yet. Notes you save from the dashboard's checklist will show up here.")
                        .font(.subheadline)
                        .foregroundStyle(RRColor.foregroundMuted)
                } else {
                    ForEach(viewModel.entries, id: \.entryDate) { entry in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(Self.formatDate(entry.entryDate))
                                .font(.footnote)
                                .foregroundStyle(RRColor.foregroundMuted)
                            Text(entry.journal)
                                .foregroundStyle(RRColor.foreground)
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(RRColor.foreground.opacity(0.06))
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }
                }
            }
            .padding(24)
        }
        .background(RRColor.background.ignoresSafeArea())
        .navigationTitle("Your Notes")
        .navigationBarTitleDisplayMode(.inline)
        .task { await viewModel.load() }
    }

    /// Formats a `YYYY-MM-DD` string as a long date, fixed to UTC so the calendar date shown
    /// always matches the date stored — never shifted by the viewer's own timezone.
    private static func formatDate(_ isoDate: String) -> String {
        let parts = isoDate.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3 else { return isoDate }

        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!
        guard let date = calendar.date(from: DateComponents(year: parts[0], month: parts[1], day: parts[2])) else {
            return isoDate
        }

        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeZone = TimeZone(identifier: "UTC")
        return formatter.string(from: date)
    }
}
