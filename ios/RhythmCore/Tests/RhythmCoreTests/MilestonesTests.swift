import Testing
@testable import RhythmCore

struct MilestonesTests {
    @Test func nextMilestoneAtZeroDaysIsNinetyDays() {
        let milestone = getNextMilestone(daysSober: 0)
        #expect(milestone.days == 90)
        #expect(milestone.label == "90 days")
        #expect(milestone.previousDays == 0)
    }

    @Test func nextMilestoneOnTheDayAMilestoneIsReachedAdvancesToTheNextOne() {
        let milestone = getNextMilestone(daysSober: 90)
        #expect(milestone.days == 180)
        #expect(milestone.label == "6 months")
        #expect(milestone.previousDays == 90)
    }

    @Test func nextMilestoneTransitionsIntoTheAnnualSequenceAfterEighteenMonths() {
        let milestone = getNextMilestone(daysSober: 545)
        #expect(milestone.days == 730)
        #expect(milestone.label == "2 years")
        #expect(milestone.previousDays == 545)
    }

    @Test func nextMilestoneContinuesAnnuallyPastTwoYears() {
        let milestone = getNextMilestone(daysSober: 730)
        #expect(milestone.days == 1095)
        #expect(milestone.label == "3 years")
        #expect(milestone.previousDays == 730)
    }

    @Test func earnedMilestonesIsEmptyBeforeFirstMilestone() {
        #expect(getEarnedMilestones(daysSober: 89).isEmpty)
    }

    @Test func earnedMilestonesAccumulatesInOrder() {
        let earned = getEarnedMilestones(daysSober: 546)
        #expect(earned.map(\.label) == ["90 days", "6 months", "9 months", "1 year", "18 months"])
        #expect(earned.last?.previousDays == 365)
    }

    @Test func milestoneProgressIsHalfwayAtTheMidpoint() {
        let next = getNextMilestone(daysSober: 45)
        #expect(milestoneProgress(daysSober: 45, milestone: next) == 50)
    }

    @Test func milestoneProgressClampsToOneHundredForAZeroSpan() {
        let milestone = Milestone(days: 90, label: "90 days", previousDays: 90)
        #expect(milestoneProgress(daysSober: 90, milestone: milestone) == 100)
    }

    @Test func milestoneProgressClampsWithinZeroToOneHundred() {
        let milestone = Milestone(days: 90, label: "90 days", previousDays: 0)
        #expect(milestoneProgress(daysSober: -10, milestone: milestone) == 0)
        #expect(milestoneProgress(daysSober: 1000, milestone: milestone) == 100)
    }
}
