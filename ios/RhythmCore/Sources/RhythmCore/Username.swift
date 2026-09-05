import Foundation

private let adjectives = [
    "Quiet", "Steady", "Calm", "Gentle", "Patient", "Grounded", "Still",
    "Clear", "Even", "Soft", "Open", "Kind", "Honest", "Faithful", "Humble",
    "Brave", "Sturdy", "Wise", "Warm", "Bright",
]

private let nouns = [
    "Falcon", "River", "Harbor", "Cedar", "Summit", "Meadow", "Compass",
    "Anchor", "Horizon", "Willow", "Ridge", "Ember", "Current", "Trail",
    "Pine", "Stone", "Maple", "Beacon", "Path", "Dawn",
]

/// A random anonymous display name suggested at onboarding, e.g. "QuietFalcon42" -- fully
/// editable from there on. Mirrors `lib/generateUsername.ts`.
public func generateUsername() -> String {
    let adjective = adjectives.randomElement()!
    let noun = nouns.randomElement()!
    let number = Int.random(in: 10...99)
    return "\(adjective)\(noun)\(number)"
}
