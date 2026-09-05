import Foundation

/// A milestone target with the span it covers, for progress-bar math.
/// `previousDays` is the prior milestone's `days` (0 for the first milestone).
public struct Milestone: Equatable, Sendable {
    public let days: Int
    public let label: String
    public let previousDays: Int

    public init(days: Int, label: String, previousDays: Int) {
        self.days = days
        self.label = label
        self.previousDays = previousDays
    }
}

private let fixedMilestones: [(days: Int, label: String)] = [
    (90, "90 days"),
    (180, "6 months"),
    (270, "9 months"),
    (365, "1 year"),
    (545, "18 months"),
]

/// 90 days, 6/9/18 months, 1 year, then annually — matches docs/mvp-scope.md → Milestones.
/// `next()` on the returned iterator is non-mutating on the wrapper itself: the running
/// state lives inside the captured closure, matching the web's generator function.
private func milestoneSequence() -> AnyIterator<(days: Int, label: String)> {
    var index = 0
    var years = 2
    var target = 730
    return AnyIterator {
        if index < fixedMilestones.count {
            defer { index += 1 }
            return fixedMilestones[index]
        }
        let milestone = (days: target, label: "\(years) years")
        target += 365
        years += 1
        return milestone
    }
}

public func getNextMilestone(daysSober: Int) -> Milestone {
    let iterator = milestoneSequence()
    var previousDays = 0
    while let milestone = iterator.next() {
        if daysSober < milestone.days {
            return Milestone(days: milestone.days, label: milestone.label, previousDays: previousDays)
        }
        previousDays = milestone.days
    }
    fatalError("unreachable")
}

/// Every milestone already reached, in order — each one earns a badge.
public func getEarnedMilestones(daysSober: Int) -> [Milestone] {
    let iterator = milestoneSequence()
    var earned: [Milestone] = []
    var previousDays = 0
    while let milestone = iterator.next() {
        if milestone.days > daysSober { break }
        earned.append(Milestone(days: milestone.days, label: milestone.label, previousDays: previousDays))
        previousDays = milestone.days
    }
    return earned
}

/// Progress toward `milestone`, as a percentage in `0...100`.
public func milestoneProgress(daysSober: Int, milestone: Milestone) -> Double {
    let span = milestone.days - milestone.previousDays
    if span <= 0 { return 100 }
    let raw = (Double(daysSober - milestone.previousDays) / Double(span)) * 100
    return min(100, max(0, raw))
}
