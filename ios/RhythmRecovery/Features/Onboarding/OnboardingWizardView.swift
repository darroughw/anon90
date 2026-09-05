import SwiftUI

struct OnboardingWizardView: View {
    let userId: UUID
    var onComplete: () -> Void

    @State private var viewModel = OnboardingViewModel()
    @State private var step = 1
    @State private var stepError: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Step \(step) of 3")
                    .font(.caption)
                    .foregroundStyle(RRColor.foregroundMuted)

                if let error = stepError ?? viewModel.errorMessage {
                    ErrorBanner(message: error)
                }

                switch step {
                case 1: stepOne
                case 2: stepTwo
                default: stepThree
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(RRColor.background.ignoresSafeArea())
    }

    private var stepOne: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Display name")
                .font(.headline)
                .foregroundStyle(RRColor.foreground)
            Text("We generated one for you. Change it if you'd like — you can edit it anytime from your profile.")
                .font(.footnote)
                .foregroundStyle(RRColor.foregroundMuted)

            TextField("Display name", text: $viewModel.username)
                .textFieldStyle(RRTextFieldStyle())
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()

            Button("Continue") {
                stepError = nil
                guard !viewModel.username.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
                    stepError = "Enter a display name."
                    return
                }
                step = 2
            }
            .buttonStyle(RRPrimaryButtonStyle())
        }
    }

    private var stepTwo: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Sobriety date")
                .font(.headline)
                .foregroundStyle(RRColor.foreground)
            Text("We count your days from here. This never resets — you can update it later if it changes.")
                .font(.footnote)
                .foregroundStyle(RRColor.foregroundMuted)

            DatePicker(
                "Sobriety date",
                selection: $viewModel.sobrietyDate,
                in: ...Date(),
                displayedComponents: .date
            )
            .datePickerStyle(.graphical)
            .tint(RRColor.foreground)
            .labelsHidden()

            HStack(spacing: 12) {
                Button("Back") { step = 1 }
                    .buttonStyle(RRSecondaryButtonStyle())
                Button("Continue") {
                    stepError = nil
                    step = 3
                }
                .buttonStyle(RRPrimaryButtonStyle())
            }
        }
    }

    private var stepThree: some View {
        VStack(alignment: .leading, spacing: 16) {
            Toggle("I have a sponsor", isOn: $viewModel.hasSponsor)
                .tint(RRColor.foreground)
            if !viewModel.hasSponsor {
                Text("That's okay for now. We'll remind you to find one until you add it later.")
                    .font(.footnote)
                    .foregroundStyle(RRColor.foregroundMuted)
            }
            Toggle("I have a service position", isOn: $viewModel.hasServicePosition)
                .tint(RRColor.foreground)
            Toggle("I have a homegroup", isOn: $viewModel.hasHomegroup)
                .tint(RRColor.foreground)

            HStack(spacing: 12) {
                Button("Back") { step = 2 }
                    .buttonStyle(RRSecondaryButtonStyle())
                Button {
                    Task {
                        if await viewModel.finish(userId: userId) {
                            onComplete()
                        }
                    }
                } label: {
                    Text("Finish")
                }
                .buttonStyle(RRPrimaryButtonStyle(isLoading: viewModel.isSubmitting))
            }
        }
        .foregroundStyle(RRColor.foreground)
    }
}
