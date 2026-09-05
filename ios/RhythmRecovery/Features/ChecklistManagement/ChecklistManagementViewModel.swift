import Foundation
import Observation
import RhythmCore

@Observable
@MainActor
final class ChecklistManagementViewModel {
    let userId: UUID
    private(set) var items: [ChecklistItem] = []
    private(set) var loading = true
    var errorMessage: String?
    var newLabel = ""
    var addingItem = false
    var busyItemId: String?
    var editingItemId: String?
    var editingLabel = ""

    /// Called after any change that the dashboard's own item list should reflect.
    var onChanged: () -> Void = {}

    private let repository = ChecklistRepository()

    init(userId: UUID) {
        self.userId = userId
    }

    var active: [ChecklistItem] {
        items.filter { !$0.archived }.sorted { $0.sortOrder < $1.sortOrder }
    }

    var archived: [ChecklistItem] {
        items.filter(\.archived)
    }

    func load() async {
        loading = true
        errorMessage = nil
        do {
            items = try await repository.fetchAll()
        } catch {
            errorMessage = "Couldn't load your checklist items. Try reopening this dialog."
        }
        loading = false
    }

    func addItem() async {
        errorMessage = nil
        addingItem = true
        defer { addingItem = false }

        do {
            try await repository.add(label: newLabel, userId: userId)
            newLabel = ""
            items = try await repository.fetchAll()
            onChanged()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func startEditing(_ item: ChecklistItem) {
        errorMessage = nil
        editingItemId = item.id
        editingLabel = item.label
    }

    func saveEditing(id: String) async {
        errorMessage = nil
        busyItemId = id
        defer { busyItemId = nil }

        do {
            try await repository.rename(id: id, label: editingLabel)
            if let index = items.firstIndex(where: { $0.id == id }) {
                items[index].label = editingLabel.trimmingCharacters(in: .whitespacesAndNewlines)
            }
            editingItemId = nil
            onChanged()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func setArchived(id: String, archived: Bool) async {
        errorMessage = nil
        busyItemId = id
        defer { busyItemId = nil }

        do {
            try await repository.setArchived(id: id, archived: archived)
            if let index = items.firstIndex(where: { $0.id == id }) {
                items[index].archived = archived
            }
            onChanged()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func reorder(id: String, direction: ReorderDirection) async {
        errorMessage = nil
        busyItemId = id

        do {
            try await repository.reorder(id: id, direction: direction)
            items = try await repository.fetchAll()
        } catch {
            errorMessage = error.localizedDescription
        }

        busyItemId = nil
        onChanged()
    }
}
