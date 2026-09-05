import Foundation
import RhythmCore
import Supabase

struct JournalRepository {
    private let client = SupabaseClient.shared

    /// `nil` when nothing has been written yet for that date.
    func fetchEntry(date: String) async throws -> JournalEntry? {
        try await client
            .from("daily_entries")
            .select("entry_date, journal")
            .eq("entry_date", value: date)
            .maybeSingle()
            .execute()
            .value
    }

    func fetchEntries(on dates: [String]) async throws -> [JournalEntry] {
        try await client
            .from("daily_entries")
            .select("entry_date, journal")
            .in("entry_date", values: dates)
            .execute()
            .value
    }

    /// All non-empty notes, newest first — powers the journal history screen.
    func fetchAllNonEmpty(userId: UUID) async throws -> [JournalEntry] {
        try await client
            .from("daily_entries")
            .select("entry_date, journal")
            .eq("user_id", value: userId)
            .neq("journal", value: "")
            .order("entry_date", ascending: false)
            .execute()
            .value
    }

    func save(userId: UUID, date: String, journal: String) async throws {
        struct JournalUpsert: Encodable {
            var userId: String
            var entryDate: String
            var journal: String

            enum CodingKeys: String, CodingKey {
                case journal
                case userId = "user_id"
                case entryDate = "entry_date"
            }
        }

        try await client
            .from("daily_entries")
            .upsert(
                JournalUpsert(userId: userId.uuidString, entryDate: date, journal: journal),
                onConflict: "user_id,entry_date"
            )
            .execute()
    }
}
