"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Alert, Button, Dialog, Input } from "@/components/ui";
import {
  addChecklistItem,
  renameChecklistItem,
  reorderChecklistItem,
  setChecklistItemArchived,
} from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem } from "@/lib/streaks";

type ChecklistManageDialogProps = {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
};

export default function ChecklistManageDialog({ open, onClose, onChanged }: ChecklistManageDialogProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("checklist_items")
        .select("id, label, sort_order, archived, created_at")
        .order("sort_order", { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError("Couldn't load your checklist items. Try reopening this dialog.");
      } else if (data) {
        setItems(data as ChecklistItem[]);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = items.filter((item) => !item.archived).sort((a, b) => a.sort_order - b.sort_order);
  const archived = items.filter((item) => item.archived);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAdding(true);

    const result = await addChecklistItem(newLabel);

    setAdding(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setNewLabel("");
    onChanged();

    const supabase = createClient();
    const { data } = await supabase
      .from("checklist_items")
      .select("id, label, sort_order, archived, created_at")
      .order("sort_order", { ascending: true });
    if (data) setItems(data as ChecklistItem[]);
  }

  function startEditing(item: ChecklistItem) {
    setError("");
    setEditingId(item.id);
    setEditingLabel(item.label);
  }

  async function saveEditing(id: string) {
    setError("");
    setBusyId(id);

    const result = await renameChecklistItem(id, editingLabel);

    setBusyId(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: editingLabel.trim() } : item)),
    );
    setEditingId(null);
    onChanged();
  }

  async function handleArchive(id: string, archived: boolean) {
    setError("");
    setBusyId(id);

    const result = await setChecklistItemArchived(id, archived);

    setBusyId(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, archived } : item)));
    onChanged();
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    setError("");
    setBusyId(id);

    const result = await reorderChecklistItem(id, direction);

    if (result.error) {
      setBusyId(null);
      setError(result.error);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("checklist_items")
      .select("id, label, sort_order, archived, created_at")
      .order("sort_order", { ascending: true });

    setBusyId(null);
    if (data) setItems(data as ChecklistItem[]);
    onChanged();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Manage checklist">
      {error && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <p className="hint">Loading...</p>
      ) : (
        <>
          {active.map((item, index) => (
            <div
              key={item.id}
              className="ds-row"
              style={{ alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}
            >
              {editingId === item.id ? (
                <>
                  <Input
                    value={editingLabel}
                    onChange={(event) => setEditingLabel(event.target.value)}
                    maxLength={80}
                    style={{ flex: 1, minWidth: 0 }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="ds-button--sm"
                    onClick={() => saveEditing(item.id)}
                    disabled={busyId === item.id}
                    loading={busyId === item.id}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ds-button--sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, minWidth: 0, overflowWrap: "break-word" }}>{item.label}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ds-button--sm"
                    onClick={() => handleReorder(item.id, "up")}
                    disabled={index === 0 || busyId === item.id}
                    aria-label={`Move "${item.label}" up`}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ds-button--sm"
                    onClick={() => handleReorder(item.id, "down")}
                    disabled={index === active.length - 1 || busyId === item.id}
                    aria-label={`Move "${item.label}" down`}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ds-button--sm"
                    onClick={() => startEditing(item)}
                  >
                    Rename
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ds-button--sm"
                    onClick={() => handleArchive(item.id, true)}
                    disabled={active.length <= 1 || busyId === item.id}
                    loading={busyId === item.id}
                  >
                    Archive
                  </Button>
                </>
              )}
            </div>
          ))}

          <form onSubmit={handleAdd} className="ds-row" style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
            <Input
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="Add a checklist item"
              maxLength={80}
              style={{ flex: 1, minWidth: 0 }}
            />
            <Button type="submit" variant="secondary" disabled={adding} loading={adding}>
              Add
            </Button>
          </form>

          {archived.length > 0 && (
            <>
              <p className="hint" style={{ marginBottom: "0.5rem" }}>
                Archived
              </p>
              {archived.map((item) => (
                <div
                  key={item.id}
                  className="ds-row"
                  style={{ alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}
                >
                  <span className="hint" style={{ flex: 1, minWidth: 0, overflowWrap: "break-word" }}>
                    {item.label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="ds-button--sm"
                    onClick={() => handleArchive(item.id, false)}
                    disabled={busyId === item.id}
                    loading={busyId === item.id}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </Dialog>
  );
}
