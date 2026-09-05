// swift-tools-version: 6.1
import PackageDescription

let package = Package(
    name: "RhythmCore",
    platforms: [
        .iOS(.v16),
        .macOS(.v13),
    ],
    products: [
        .library(name: "RhythmCore", targets: ["RhythmCore"]),
    ],
    targets: [
        .target(name: "RhythmCore"),
        .testTarget(name: "RhythmCoreTests", dependencies: ["RhythmCore"]),
    ]
)
