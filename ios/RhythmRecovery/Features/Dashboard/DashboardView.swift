import RhythmCore
import SwiftUI

struct DashboardView: View {
    @State var viewModel: DashboardViewModel
    @Environment(AuthStore.self) private var authStore

    @State private var editingProfile = false
    @State private var editingChecklistPresented = false
    @State private var showingJournalHistory = false
    @State private var showLateReminder = false
    @State private var remindedThisSession = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    header

                    Text("\u{201C}\(viewModel.dailyQuote)\u{201D}")
                        .font(.footnote.italic())
                        .foregroundStyle(RRColor.foregroundMuted)
                        .frame(maxWidth: .infinity, alignment: .center)

                    if let error = viewModel.errorMessage {
                        ErrorBanner(message: error)
                    }

                    if showLateReminder {
                        InfoBanner(message: "It's later in the day. A few tasks are still open on today's list.")
                    }

                    nudgeBanners

                    VStack(spacing: 2) {
                        Text("\(viewModel.daysSober)")
                            .font(.largeTitle.bold())
                            .glow()
                        Text("Days sober")
                            .font(.caption)
                            .foregroundStyle(RRColor.foregroundMuted)
                    }
                    .frame(maxWidth: .infinity)

                    if viewModel.loading {
                        ProgressView()
                            .tint(RRColor.foreground)
                            .frame(maxWidth: .infinity)
                    } else {
                        RhythmBarStripView(
                            dayStreak: viewModel.dayStreak,
                            weekStreak: viewModel.weekStreak,
                            history: viewModel.recentHistory
                        )

                        MilestoneSectionView(
                            nextMilestone: viewModel.nextMilestone,
                            progressPercent: viewModel.milestoneProgressPercent,
                            earnedMilestones: viewModel.earnedMilestones
                        )

                        JournalEchoView(anniversaries: viewModel.anniversaries)

                        ChecklistCardView(viewModel: viewModel) {
                            showingJournalHistory = true
                        }

                        if let url = URL(string: "https://www.aa.org/daily-reflections") {
                            Link("Read today's AA Daily Reflection", destination: url)
                                .font(.footnote)
                                .frame(maxWidth: .infinity, alignment: .center)
                        }

                        HelpfulLinksView()
                    }
                }
                .padding(20)
            }
            .background(RRColor.background.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(isPresented: $showingJournalHistory) {
                JournalHistoryView(viewModel: JournalHistoryViewModel(userId: viewModel.userId))
            }
            .sheet(isPresented: $editingProfile) {
                profileEditSheet
            }
            .sheet(isPresented: $editingChecklistPresented) {
                checklistManagementSheet
            }
        }
        .task {
            await viewModel.load()
            checkLateReminder()
        }
        .onReceive(Timer.publish(every: 60, on: .main, in: .common).autoconnect()) { _ in
            Task {
                await viewModel.checkDayRollover()
                checkLateReminder()
            }
        }
    }

    private var header: some View {
        VStack(spacing: 12) {
            Text("Welcome back, \(viewModel.profile.username)")
                .font(.title2.bold())
                .foregroundStyle(RRColor.foreground)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)

            HStack(spacing: 10) {
                Button("Edit profile") { editingProfile = true }
                    .buttonStyle(RRSecondaryButtonStyle())
                Button("Manage checklist") { editingChecklistPresented = true }
                    .buttonStyle(RRSecondaryButtonStyle())
            }

            Button("Log out") {
                Task { await authStore.signOut() }
            }
            .font(.footnote)
            .foregroundStyle(RRColor.foregroundMuted)
        }
    }

    @ViewBuilder
    private var nudgeBanners: some View {
        if !viewModel.profile.hasSponsor {
            InfoBanner(message: "Consider finding a sponsor. You can add one anytime from your profile.")
        }
        if !viewModel.profile.hasServicePosition {
            InfoBanner(message: "Consider taking on a service position. You can add one anytime from your profile.")
        }
        if !viewModel.profile.hasHomegroup {
            InfoBanner(message: "Consider finding a homegroup. You can add one anytime from your profile.")
        }
    }

    private var profileEditSheet: some View {
        let profileViewModel = ProfileEditViewModel(userId: viewModel.userId, profile: viewModel.profile)
        profileViewModel.onSaved = { profile in
            viewModel.profile = profile
            Task { await viewModel.syncNotifications() }
        }
        return ProfileEditView(viewModel: profileViewModel) {
            editingProfile = false
            Task { await authStore.signOut() }
        }
    }

    private var checklistManagementSheet: some View {
        let checklistViewModel = ChecklistManagementViewModel(userId: viewModel.userId)
        checklistViewModel.onChanged = {
            Task { await viewModel.reloadChecklistItems() }
        }
        return ChecklistManagementView(viewModel: checklistViewModel)
    }

    /// Mirrors the web's after-9pm in-app toast: fires at most once per session, only when
    /// the reminder preference is on and today's list is still incomplete.
    private func checkLateReminder() {
        guard !remindedThisSession, viewModel.profile.reminderToastEnabled, !viewModel.dayComplete else { return }
        guard Calendar.current.component(.hour, from: Date()) >= 21 else { return }
        remindedThisSession = true
        showLateReminder = true
    }
}
