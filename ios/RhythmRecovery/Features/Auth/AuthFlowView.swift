import SwiftUI

enum AuthFlowMode {
    case login
    case signup
    case forgotPassword
}

/// Hosts Login/Signup and the single `AuthViewModel` they share, so toggling between the
/// two doesn't lose whatever the user already typed or an in-flight error message.
struct AuthFlowView: View {
    @State private var mode: AuthFlowMode = .login
    @State private var viewModel = AuthViewModel()

    var body: some View {
        Group {
            switch mode {
            case .login:
                LoginView(viewModel: viewModel, mode: $mode)
            case .signup:
                SignupView(viewModel: viewModel, mode: $mode)
            case .forgotPassword:
                ForgotPasswordView(viewModel: viewModel, mode: $mode)
            }
        }
        .background(RRColor.background.ignoresSafeArea())
    }
}
