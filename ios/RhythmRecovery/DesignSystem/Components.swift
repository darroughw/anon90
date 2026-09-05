import SwiftUI

struct RRPrimaryButtonStyle: ButtonStyle {
    var isLoading: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 8) {
            if isLoading {
                ProgressView().tint(RRColor.background)
            }
            configuration.label
        }
        .font(.headline)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(RRColor.foreground)
        .foregroundStyle(RRColor.background)
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
        .opacity(configuration.isPressed ? 0.85 : 1)
    }
}

struct RRSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .foregroundStyle(RRColor.foreground)
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(RRColor.border, lineWidth: 1)
            )
            .opacity(configuration.isPressed ? 0.7 : 1)
    }
}

struct RRTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(12)
            .foregroundStyle(RRColor.foreground)
            .tint(RRColor.foreground)
            .background(RRColor.foreground.opacity(0.06))
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(RRColor.border, lineWidth: 1)
            )
    }
}

struct ErrorBanner: View {
    let message: String

    var body: some View {
        Text(message)
            .font(.callout)
            .foregroundStyle(RRColor.error)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RRColor.error.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

struct InfoBanner: View {
    let message: String

    var body: some View {
        Text(message)
            .font(.callout)
            .foregroundStyle(RRColor.foreground)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RRColor.foreground.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

struct SectionDivider: View {
    var label: String?

    var body: some View {
        HStack(spacing: 12) {
            Rectangle().fill(RRColor.border).frame(height: 1)
            if let label {
                Text(label)
                    .font(.caption)
                    .foregroundStyle(RRColor.foregroundMuted)
                Rectangle().fill(RRColor.border).frame(height: 1)
            }
        }
    }
}
