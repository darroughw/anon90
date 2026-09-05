import SwiftUI

struct SignupView: View {
    @Bindable var viewModel: AuthViewModel
    @Binding var mode: AuthFlowMode
    @FocusState private var focusedField: Field?

    private enum Field {
        case email, password
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                VStack(spacing: 6) {
                    Text("Start your rhythm")
                        .font(.title2.bold())
                        .glow()
                    Text("A place to track the daily commitments that hold your recovery together.")
                        .font(.subheadline)
                        .foregroundStyle(RRColor.foregroundMuted)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 40)

                if viewModel.awaitingEmailConfirmation {
                    InfoBanner(message: "Check your email to confirm your account, then come back and sign in.")
                } else {
                    if let error = viewModel.errorMessage {
                        ErrorBanner(message: error)
                    }

                    AppleSignInButton(viewModel: viewModel)

                    SectionDivider(label: "or")

                    VStack(spacing: 12) {
                        TextField("Email address", text: $viewModel.email)
                            .textFieldStyle(RRTextFieldStyle())
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .focused($focusedField, equals: .email)
                            .submitLabel(.next)
                            .onSubmit { focusedField = .password }

                        VStack(alignment: .leading, spacing: 4) {
                            SecureField("Password", text: $viewModel.password)
                                .textFieldStyle(RRTextFieldStyle())
                                .textContentType(.newPassword)
                                .focused($focusedField, equals: .password)
                                .submitLabel(.go)
                                .onSubmit { Task { await viewModel.signUp() } }
                            Text("At least 8 characters.")
                                .font(.caption)
                                .foregroundStyle(RRColor.foregroundMuted)
                        }
                    }

                    Button {
                        Task { await viewModel.signUp() }
                    } label: {
                        Text("Create account")
                    }
                    .buttonStyle(RRPrimaryButtonStyle(isLoading: viewModel.isSubmitting))
                    .disabled(
                        viewModel.isSubmitting || viewModel.email.isEmpty || viewModel.password.count < 8
                    )
                }

                Button {
                    viewModel.errorMessage = nil
                    mode = .login
                } label: {
                    Text("Already have an account? Sign in")
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
