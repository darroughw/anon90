import SwiftUI

struct LoginView: View {
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
                    Text("Welcome back")
                        .font(.title2.bold())
                        .glow()
                    Text("Sign in to pick up where you left off.")
                        .font(.subheadline)
                        .foregroundStyle(RRColor.foregroundMuted)
                }
                .padding(.top, 40)

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

                    SecureField("Password", text: $viewModel.password)
                        .textFieldStyle(RRTextFieldStyle())
                        .textContentType(.password)
                        .focused($focusedField, equals: .password)
                        .submitLabel(.go)
                        .onSubmit { Task { await viewModel.signIn() } }
                }

                Button("Forgot password?") {
                    viewModel.errorMessage = nil
                    mode = .forgotPassword
                }
                .font(.footnote)
                .foregroundStyle(RRColor.foregroundMuted)
                .frame(maxWidth: .infinity, alignment: .trailing)

                Button {
                    Task { await viewModel.signIn() }
                } label: {
                    Text("Sign in")
                }
                .buttonStyle(RRPrimaryButtonStyle(isLoading: viewModel.isSubmitting))
                .disabled(viewModel.isSubmitting || viewModel.email.isEmpty || viewModel.password.isEmpty)

                Button {
                    viewModel.errorMessage = nil
                    mode = .signup
                } label: {
                    Text("Need an account? Create one")
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
