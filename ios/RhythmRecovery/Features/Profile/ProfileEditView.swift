import RhythmCore
import SwiftUI

struct ProfileEditView: View {
    @Bindable var viewModel: ProfileEditViewModel
    /// Called once account deletion succeeds — the caller signs the user out and returns to
    /// the login screen (deletion itself already removed the account server-side).
    var onAccountDeleted: () -> Void
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                if let error = viewModel.errorMessage {
                    Section {
                        ErrorBanner(message: error)
                    }
                    .listRowBackground(RRColor.background)
                }

                Section("Display name") {
                    TextField("Display name", text: $viewModel.username)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Text("Shown instead of your email anywhere your progress is shared.")
                        .font(.caption)
                        .foregroundStyle(RRColor.foregroundMuted)
                }
                .listRowBackground(RRColor.background)

                Section("Sobriety date") {
                    DatePicker(
                        "Sobriety date",
                        selection: $viewModel.sobrietyDate,
                        in: ...Date(),
                        displayedComponents: .date
                    )
                    Text("Changing this recalculates your streak, days sober, and milestones.")
                        .font(.caption)
                        .foregroundStyle(RRColor.foregroundMuted)
                }
                .listRowBackground(RRColor.background)

                Section {
                    Toggle("I have a sponsor", isOn: $viewModel.hasSponsor)
                    Toggle("I have a service position", isOn: $viewModel.hasServicePosition)
                    Toggle("I have a homegroup", isOn: $viewModel.hasHomegroup)
                }
                .listRowBackground(RRColor.background)

                Section("Reminders") {
                    Toggle("Remind me in-app if today's list is still open", isOn: $viewModel.reminderToastEnabled)
                    Toggle("Email me if today's list is still open", isOn: $viewModel.reminderEmailEnabled)
                    Toggle("Send me product updates and tips", isOn: $viewModel.marketingEmailsOptIn)
                }
                .listRowBackground(RRColor.background)

                Section {
                    if !viewModel.confirmingDelete {
                        Button("Delete account", role: .destructive) {
                            viewModel.confirmingDelete = true
                        }
                    } else {
                        VStack(alignment: .leading, spacing: 12) {
                            if let deleteError = viewModel.deleteErrorMessage {
                                ErrorBanner(message: deleteError)
                            }
                            Text("This permanently deletes your profile, activity history, and preferences. It can't be undone.")
                                .font(.footnote)
                                .foregroundStyle(RRColor.foregroundMuted)
                            HStack {
                                Button("Cancel") { viewModel.confirmingDelete = false }
                                    .buttonStyle(RRSecondaryButtonStyle())
                                Button("Yes, permanently delete", role: .destructive) {
                                    Task {
                                        if await viewModel.deleteAccount() {
                                            onAccountDeleted()
                                        }
                                    }
                                }
                                .disabled(viewModel.isDeleting)
                            }
                        }
                    }
                }
                .listRowBackground(RRColor.background)
            }
            .scrollContentBackground(.hidden)
            .background(RRColor.background.ignoresSafeArea())
            .navigationTitle("Edit profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button {
                        Task {
                            if await viewModel.save() {
                                dismiss()
                            }
                        }
                    } label: {
                        if viewModel.isSubmitting {
                            ProgressView()
                        } else {
                            Text("Save")
                        }
                    }
                    .disabled(viewModel.isSubmitting)
                }
            }
        }
    }
}
