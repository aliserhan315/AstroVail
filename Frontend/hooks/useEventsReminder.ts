import { useState, useCallback } from "react";
import { EventsAPI } from "@/lib/endpoint";

export function useEventsReminder() {
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());

  const setReminder = useCallback(async (id: string) => {
    if (savingIds.has(id) || remindedIds.has(id)) return;
    setSavingIds(prev => new Set(prev).add(id));
    try {
      await EventsAPI.remind(id);
      setRemindedIds(prev => new Set(prev).add(id));
    } catch (e: any) {
      const code = e?.response?.status;
      const msg = String(e?.message || "").toLowerCase();
      if (code === 409 || msg.includes("duplicate")) {
        setRemindedIds(prev => new Set(prev).add(id));
      } else { throw e; }
    } finally {
      setSavingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  }, [savingIds, remindedIds]);

  return {
    setReminder,
    isSaving: (id: string) => savingIds.has(id),
    isReminded: (id: string) => remindedIds.has(id),
  };
}
