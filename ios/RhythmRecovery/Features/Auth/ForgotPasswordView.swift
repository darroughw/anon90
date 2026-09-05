import SwiftUI

struct ForgotPasswordView: View {
    @Bindable var viewModel: AuthViewModel
    @Binding var mode: AuthFlowMode
    @FocusState private var emailFocused: Bool

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                VStack(spacing: 6) {
                    Text("Reset your password")
                        .font(.title2.bold())
                        .glow()
                    Text("Enter your email and we'll send you a link to set a new password.")
                        .font(.subheadline)
                        .foregroundStyle(RRColor.foregroundMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                if viewModel.passwordResetSent {
                    InfoBanner(message: "If an account exists for that email, a reset link is on its way. Check your inbox (and spam folder) — the link opens in your browser to finish.")
                } else {
                    if let error = viewModel.errorMessage {
                        ErrorBanner(message: error)
                    }

                    TextField("Email address", text: $viewModel.email)
                        .textFieldStyle(RRTextFieldStyle())
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .focused($emailFocused)
                        .submitLabel(.send)
                        .onSubmit { Task { await viewModel.sendPasswordReset() } }

                    Button {
                        Task { await viewModel.sendPasswordReset() }
                    } label: {
                        Text("Send reset link")
                    }
                    .buttonStyle(RRPrimaryButtonStyle(isLoading: viewModel.isSubmitting))
                    .disabled(viewModel.isSubmitting || viewModel.email.isEmpty)
                }

                Button("Back to sign in") {
                    viewModel.errorMessage = nil
                    viewModel.passwordResetSent = false
                    mode = .login
                }
                .font(.footnote)
                .foregroundStyle(RRColor.foregroundMuted)
                .padding(.top, 4)
            }
            .padding(24)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(RRColor.background.ignoresSafeArea())
    }
}
