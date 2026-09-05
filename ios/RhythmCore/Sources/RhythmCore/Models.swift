import Foundation

/// A single checklist item a user tracks daily. Mirrors the `checklist_items` table.
///
/// Ids and dates are kept as plain `String` (not `UUID`/`Date`) so this type can be
/// compared, hashed, and date-mathed exactly like the web app's TypeScript model —
/// `entry_date`/`created_at` are `YYYY-MM-DD` calendar-date strings, not instants.
/// The Services layer converts to/from `UUID` and Postgres timestamps at the boundary.
public struct ChecklistItem: Codable, Identifiable, Equatable, Sendable {
    public let id: String
    public var label: String
    public var sortOrder: Int
    public var archived: Bool
    /// `YYYY-MM-DD...` — only the first 10 characters are ever compared against a date.
    public let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, label, archived
        case sortOrder = "sort_order"
        case createdAt = "created_at"
    }

    public init(id: String, label: String, sortOrder: Int, archived: Bool, createdAt: String) {
        self.id = id
        self.label = label
        self.sortOrder = sortOrder
        self.archived = archived
        self.createdAt = createdAt
    }
}

/// One day's completion state for one checklist item. Mirrors `daily_entry_completions`.
/// Absence of a row for a given (date, item) pair means "not completed".
public struct Completion: Codable, Equatable, Sendable {
    public let entryDate: String
    public let checklistItemId: String
    public let completed: Bool

    enum CodingKeys: String, CodingKey {
        case completed
        case entryDate = "entry_date"
        case checklistItemId = "checklist_item_id"
    }

    public init(entryDate: String, checklistItemId: String, completed: Bool) {
        self.entryDate = entryDate
        self.checklistItemId = checklistItemId
        self.completed = completed
    }
}

/// A single day's journal note. Mirrors the `journal`/`entry_date` columns of `daily_entries`.
public struct JournalEntry: Codable, Equatable, Sendable {
    public let entryDate: String
    public let journal: String

    enum CodingKeys: String, CodingKey {
        case journal
        case entryDate = "entry_date"
    }

    public init(entryDate: String, journal: String) {
        self.entryDate = entryDate
        self.journal = journal
    }
}

/// A profile row's fields relevant to `RhythmCore` logic. Mirrors `profiles`.
public struct Profile: Codable, Equatable, Sendable {
    public var username: String
    public var sobrietyDate: String
    public var hasSponsor: Bool
    public var hasServicePosition: Bool
    public var hasHomegroup: Bool
    public var reminderToastEnabled: Bool
    public var reminderEmailEnabled: Bool
    public var marketingEmailsOptIn: Bool

    enum CodingKeys: String, CodingKey {
        case username
        case sobrietyDate = "sobriety_date"
        case hasSponsor = "has_sponsor"
        case hasServicePosition = "has_service_position"
        case hasHomegroup = "has_homegroup"
        case reminderToastEnabled = "reminder_toast_enabled"
        case reminderEmailEnabled = "reminder_email_enabled"
        case marketingEmailsOptIn = "marketing_emails_opt_in"
    }

    public init(
        username: String,
        sobrietyDate: String,
        hasSponsor: Bool,
        hasServicePosition: Bool,
        hasHomegroup: Bool,
        reminderToastEnabled: Bool,
        reminderEmailEnabled: Bool,
        marketingEmailsOptIn: Bool
    ) {
        self.username = username
        self.sobrietyDate = sobrietyDate
        self.hasSponsor = hasSponsor
        self.hasServicePosition = hasServicePosition
        self.hasHomegroup = hasHomegroup
        self.reminderToastEnabled = reminderToastEnabled
        self.reminderEmailEnabled = reminderEmailEnabled
        self.marketingEmailsOptIn = marketingEmailsOptIn
    }
}
