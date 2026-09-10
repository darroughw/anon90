import SwiftUI

/// Same glyph as the wordmark icon (public/assets/logo/rhythm-recovery.svg, first <path>),
/// isolated to its own tight viewBox. Path data is copied verbatim from
/// components/dashboard/DailyProgressBar.tsx on the web — keep both in sync.
enum LogoGlyph {
    static let pathData =
        "M84 188V151C84 145.667 86.6667 143 92 143H96C101.333 143 104 145.667 104 151V225C104 230.333 106.667 233 112 233H116C121.333 233 124 230.333 124 225V126C124 120.667 126.667 118 132 118H136C141.333 118 144 120.667 144 126V250C144 255.333 146.667 258 152 258H156C161.333 258 164 255.333 164 250V166C164 160.667 166.667 158 172 158H176C181.333 158 184 160.667 184 166V210C184 215.333 186.667 218 192 218H196C201.333 218 204 215.333 204 210V161C204 155.667 206.667 153 212 153C217.333 153 220 155.667 220 161V215C220 220.333 222.667 223 228 223C233.333 223 236 220.333 236 215V176C236 170.667 238.667 168 244 168C249.333 168 252 170.667 252 176V200C252 205.333 254.667 208 260 208C265.333 208 268 205.333 268 200V184C268 178.667 270.667 176 276 176H280C285.333 176 288 178.667 288 184V192C288 197.333 290.667 200 296 200H304"

    static let viewBox = CGRect(x: 81, y: 115, width: 226, height: 146)

    /// Parses `pathData` (M/H/V/C, absolute coordinates only — the only commands the
    /// source SVG uses) into a SwiftUI Path in the glyph's own coordinate space.
    static func path() -> Path {
        var path = Path()
        var current = CGPoint.zero
        let scanner = Scanner(string: pathData)
        scanner.charactersToBeSkipped = CharacterSet(charactersIn: ", ")

        func readDouble() -> CGFloat {
            CGFloat(scanner.scanDouble() ?? 0)
        }

        while !scanner.isAtEnd {
            guard let command = scanner.scanCharacter() else { break }
            switch command {
            case "M":
                current = CGPoint(x: readDouble(), y: readDouble())
                path.move(to: current)
            case "H":
                current = CGPoint(x: readDouble(), y: current.y)
                path.addLine(to: current)
            case "V":
                current = CGPoint(x: current.x, y: readDouble())
                path.addLine(to: current)
            case "C":
                let control1 = CGPoint(x: readDouble(), y: readDouble())
                let control2 = CGPoint(x: readDouble(), y: readDouble())
                current = CGPoint(x: readDouble(), y: readDouble())
                path.addCurve(to: current, control1: control1, control2: control2)
            default:
                break
            }
        }
        return path
    }
}

/// The parsed glyph, scaled and centered to fit an arbitrary rect — lets the same path
/// be stroked at any size, e.g. `LogoGlyphShape().stroke(...)`.
struct LogoGlyphShape: Shape {
    func path(in rect: CGRect) -> Path {
        let viewBox = LogoGlyph.viewBox
        let scale = min(rect.width / viewBox.width, rect.height / viewBox.height)
        let scaledWidth = viewBox.width * scale
        let scaledHeight = viewBox.height * scale
        let dx = rect.minX + (rect.width - scaledWidth) / 2 - viewBox.minX * scale
        let dy = rect.minY + (rect.height - scaledHeight) / 2 - viewBox.minY * scale

        return LogoGlyph.path()
            .applying(CGAffineTransform(scaleX: scale, y: scale))
            .applying(CGAffineTransform(translationX: dx, y: dy))
    }
}
