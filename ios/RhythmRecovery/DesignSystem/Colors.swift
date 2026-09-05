import SwiftUI

/// Dark-only palette matching docs/mvp-scope.md → Color Palette. Light mode is
/// explicitly out of scope for MVP (`UIUserInterfaceStyle: Dark` is forced app-wide).
enum RRColor {
    static let background = Color(hex: 0x1A120B)
    static let foreground = Color(hex: 0xF2E9DD)
    static let foregroundMuted = Color(hex: 0xF2E9DD, opacity: 0.72)
    static let border = Color(hex: 0xF2E9DD, opacity: 0.24)
    static let error = Color(hex: 0xE07856)
}

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: opacity)
    }
}
