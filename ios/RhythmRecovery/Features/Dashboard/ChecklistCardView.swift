import RhythmCore
import SwiftUI

struct ChecklistCardView: View {
    @Bindable var viewModel: DashboardViewModel
    var onOpenHistory: () -> Void

    @FocusState private var journalFocused: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Today's checklist")
                    .font(.headline)
                    .foregroundStyle(RRColor.foreground)
                Spacer()
                if viewModel.dayComplete {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(RRColor.foreground)
                }
            }

            ProgressView(
                value: Double(viewModel.completedTodayCount),
                total: Double(max(viewModel.requiredToday.count, 1))
            )
            .tint(RRColor.foreground)

            if viewModel.dayComplete {
                Text("Today's list is complete.")
                    .font(.footnote)
                    .foregroundStyle(RRColor.foregroundMuted)
            }

            VStack(alignment: .leading, spacing: 10) {
                ForEach(viewModel.requiredToday) { item in
                    let checked = viewModel.todayCompletedItemIds.contains(item.id)
                    Button {
                        Task { await viewModel.toggleItem(item.id) }
                    } label: {
                        HStack(spacing: 10) {
                            Image(systemName: checked ? "checkmark.square.fill" : "square")
                            Text(item.label)
                            Spacer()
                        }
                    }
                    .foregroundStyle(RRColor.foreground)
                }
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("A note to your future self")
                    .font(.footnote)
                    .foregroundStyle(RRColor.foregroundMuted)

                TextEditor(text: $viewModel.journalText)
                    .frame(minHeight: 100)
                    .scrollContentBackground(.hidden)
                    .padding(8)
                    .foregroundStyle(RRColor.foreground)
                    .background(RRColor.foreground.opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .focused($journalFocused)
                    .onChange(of: journalFocused) { _, isFocused in
                        if !isFocused {
                            Task { await viewModel.saveJournal() }
                        }
                    }

                if !viewModel.journalStatus.isEmpty {
                    Text(viewModel.journalStatus)
                        .font(.caption2)
                        .foregroundStyle(RRColor.foregroundMuted)
                }

                Button("View your past notes →") { onOpenHistory() }
                    .font(.footnote)
                    .foregroundStyle(RRColor.foregroundMuted)
            }
        }
        .padding(16)
        .background(RRColor.foreground.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}
