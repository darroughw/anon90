import RhythmCore
import SwiftUI

struct ChecklistManagementView: View {
    @Bindable var viewModel: ChecklistManagementViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                if let error = viewModel.errorMessage {
                    Section {
                        ErrorBanner(message: error)
                            .listRowBackground(RRColor.background)
                    }
                }

                if viewModel.loading {
                    ProgressView()
                        .listRowBackground(RRColor.background)
                } else {
                    Section {
                        ForEach(Array(viewModel.active.enumerated()), id: \.element.id) { index, item in
                            activeRow(item, index: index)
                        }
                    }
                    .listRowBackground(RRColor.background)

                    Section {
                        HStack {
                            TextField("Add a checklist item", text: $viewModel.newLabel)
                                .textFieldStyle(RRTextFieldStyle())
                            Button("Add") {
                                Task { await viewModel.addItem() }
                            }
                            .buttonStyle(RRSecondaryButtonStyle())
                            .disabled(viewModel.addingItem || viewModel.newLabel.trimmingCharacters(in: .whitespaces).isEmpty)
                        }
                    }
                    .listRowBackground(RRColor.background)

                    if !viewModel.archived.isEmpty {
                        Section("Archived") {
                            ForEach(viewModel.archived) { item in
                                HStack {
                                    Text(item.label)
                                        .foregroundStyle(RRColor.foregroundMuted)
                                    Spacer()
                                    Button("Restore") {
                                        Task { await viewModel.setArchived(id: item.id, archived: false) }
                                    }
                                    .buttonStyle(.borderless)
                                    .disabled(viewModel.busyItemId == item.id)
                                }
                            }
                        }
                        .listRowBackground(RRColor.background)
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(RRColor.background.ignoresSafeArea())
            .navigationTitle("Manage checklist")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .task { await viewModel.load() }
    }

    @ViewBuilder
    private func activeRow(_ item: ChecklistItem, index: Int) -> some View {
        if viewModel.editingItemId == item.id {
            HStack {
                TextField("Label", text: $viewModel.editingLabel)
                    .textFieldStyle(RRTextFieldStyle())
                Button("Save") {
                    Task { await viewModel.saveEditing(id: item.id) }
                }
                .buttonStyle(.borderless)
                .disabled(viewModel.busyItemId == item.id)
                Button("Cancel") { viewModel.editingItemId = nil }
                    .buttonStyle(.borderless)
            }
        } else {
            HStack {
                Text(item.label)
                    .foregroundStyle(RRColor.foreground)
                Spacer()
                Button {
                    Task { await viewModel.reorder(id: item.id, direction: .up) }
                } label: {
                    Image(systemName: "chevron.up")
                }
                .buttonStyle(.borderless)
                .disabled(index == 0 || viewModel.busyItemId == item.id)

                Button {
                    Task { await viewModel.reorder(id: item.id, direction: .down) }
                } label: {
                    Image(systemName: "chevron.down")
                }
                .buttonStyle(.borderless)
                .disabled(index == viewModel.active.count - 1 || viewModel.busyItemId == item.id)

                Button("Rename") { viewModel.startEditing(item) }
                    .buttonStyle(.borderless)

                Button("Archive") {
                    Task { await viewModel.setArchived(id: item.id, archived: true) }
                }
                .buttonStyle(.borderless)
                .disabled(viewModel.active.count <= 1 || viewModel.busyItemId == item.id)
            }
        }
    }
}
