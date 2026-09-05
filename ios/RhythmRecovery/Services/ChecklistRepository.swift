import Foundation
import RhythmCore
import Supabase

enum ReorderDirection {
    case up, down
}

enum ChecklistError: LocalizedError {
    case invalidLabel
    case needsOneActiveItem

    var errorDescription: String? {
        switch self {
        case .invalidLabel: "Checklist item must be 1-80 characters."
        case .needsOneActiveItem: "You need at least one active checklist item."
        }
    }
}

struct ChecklistRepository {
    private let client = SupabaseClient.shared
    private let labelMaxLength = 80
    private let columns = "id, label, sort_order, archived, created_at"

    private struct NewChecklistItem: Encodable {
        var userId: String
        var label: String
        var sortOrder: Int

        enum CodingKeys: String, CodingKey {
            case label
            case userId = "user_id"
            case sortOrder = "sort_order"
        }
    }

    /// Seeds the starting suggestions for a brand-new profile, in order.
    func seedDefaults(userId: UUID) async throws {
        let items = defaultChecklistItems.enumerated().map { index, label in
            NewChecklistItem(userId: userId.uuidString, label: label, sortOrder: index)
        }
        try await client.from("checklist_items").insert(items).execute()
    }

    func fetchAll() async throws -> [ChecklistItem] {
        try await client
            .from("checklist_items")
            .select(columns)
            .order("sort_order", ascending: true)
            .execute()
            .value
    }

    /// Active (non-archived) items only, in display order — what the dashboard shows.
    func fetchActive() async throws -> [ChecklistItem] {
        try await client
            .from("checklist_items")
            .select(columns)
            .eq("archived", value: false)
            .order("sort_order", ascending: true)
            .execute()
            .value
    }

    private func validated(_ label: String) throws -> String {
        let trimmed = label.trimmingCharacters(in: .whitespacesAndNewlines)
        guard (1...labelMaxLength).contains(trimmed.count) else {
            throw ChecklistError.invalidLabel
        }
        return trimmed
    }

    func add(label: String, userId: UUID) async throws {
        let trimmed = try validated(label)
        let active = try await fetchActive()
        let nextOrder = (active.map(\.sortOrder).max() ?? -1) + 1

        try await client
            .from("checklist_items")
            .insert(NewChecklistItem(userId: userId.uuidString, label: trimmed, sortOrder: nextOrder))
            .execute()
    }

    func rename(id: String, label: String) async throws {
        let trimmed = try validated(label)
        try await client
            .from("checklist_items")
            .update(["label": trimmed])
            .eq("id", value: id)
            .execute()
    }

    /// Archiving is the only "removal" users get — history stays intact, and archived items
    /// stop counting toward required tasks for every date, past included (`RhythmCore`'s
    /// `requiredItemsForDate`). Always leaves at least one active item, or the checklist (and
    /// streak) has nothing to be complete against.
    func setArchived(id: String, archived: Bool) async throws {
        if archived {
            let active = try await fetchActive()
            guard active.contains(where: { $0.id != id }) else {
                throw ChecklistError.needsOneActiveItem
            }
        }

        try await client
            .from("checklist_items")
            .update(["archived": archived])
            .eq("id", value: id)
            .execute()
    }

    /// Swaps `sort_order` with the adjacent active item — a no-op at either end of the list.
    func reorder(id: String, direction: ReorderDirection) async throws {
        let active = try await fetchActive()
        guard let index = active.firstIndex(where: { $0.id == id }) else { return }
        let swapIndex = direction == .up ? index - 1 : index + 1
        guard active.indices.contains(swapIndex) else { return }

        let a = active[index]
        let b = active[swapIndex]

        try await client.from("checklist_items").update(["sort_order": b.sortOrder]).eq("id", value: a.id).execute()
        try await client.from("checklist_items").update(["sort_order": a.sortOrder]).eq("id", value: b.id).execute()
    }

    // MARK: Completions

    func fetchCompletions(since date: String) async throws -> [Completion] {
        try await client
            .from("daily_entry_completions")
            .select("entry_date, checklist_item_id, completed")
            .gte("entry_date", value: date)
            .execute()
            .value
    }

    func setCompletion(userId: UUID, date: String, itemId: String, completed: Bool) async throws {
        struct CompletionUpsert: Encodable {
            var userId: String
            var entryDate: String
            var checklistItemId: String
            var completed: Bool

            enum CodingKeys: String, CodingKey {
                case completed
                case userId = "user_id"
                case entryDate = "entry_date"
                case checklistItemId = "checklist_item_id"
            }
        }

        try await client
            .from("daily_entry_completions")
            .upsert(
                CompletionUpsert(userId: userId.uuidString, entryDate: date, checklistItemId: itemId, completed: completed),
                onConflict: "user_id,entry_date,checklist_item_id"
            )
            .execute()
    }
}
