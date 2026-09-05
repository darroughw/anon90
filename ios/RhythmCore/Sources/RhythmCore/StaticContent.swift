import Foundation

/// Starting suggestions seeded for every new profile at onboarding -- fully editable
/// from there on. Order matters: `sortOrder` is seeded from this array's index.
public let defaultChecklistItems: [String] = [
    "Read literature",
    "Pray or meditate (morning)",
    "Call your sponsor",
    "Call someone in the fellowship",
    "Go to a meeting",
    "Didn't drink or use",
    "Pray or meditate (evening)",
]

public struct HelpfulLink: Equatable, Sendable {
    public let label: String
    public let href: String
    public let description: String

    public init(label: String, href: String, description: String) {
        self.label = label
        self.href = href
        self.description = description
    }
}

public let helpfulLinks: [HelpfulLink] = [
    HelpfulLink(
        label: "SAMHSA National Helpline",
        href: "https://www.samhsa.gov/find-help/national-helpline",
        description: "Free, confidential, 24/7. Call or text 1-800-662-4357."
    ),
    HelpfulLink(
        label: "988 Suicide & Crisis Lifeline",
        href: "https://988lifeline.org",
        description: "Call or text 988, 24/7."
    ),
    HelpfulLink(
        label: "AA meeting finder",
        href: "https://www.aa.org/find-aa",
        description: "Find an Alcoholics Anonymous meeting near you."
    ),
    HelpfulLink(
        label: "AA Daily Reflections",
        href: "https://www.aa.org/daily-reflections",
        description: "A short reflection for today, from AA's Conference-approved literature."
    ),
    HelpfulLink(
        label: "NA meeting finder",
        href: "https://www.na.org/meetingsearch/",
        description: "Find a Narcotics Anonymous meeting near you."
    ),
    HelpfulLink(
        label: "Al-Anon",
        href: "https://al-anon.org",
        description: "Support for friends and family of people affected by someone else's drinking."
    ),
]
