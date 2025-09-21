import { useState, useCallback, useEffect } from "react";
import { EventsAPI } from "@/lib/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSelector } from "@/state/hooks";

export function useEventsReminder() {
  const userId = useAppSelector((s) => s.auth.user?._id || "guest");
  const storageKey = `av_events_reminded_${userId}`;
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        const arr: string[] = raw ? JSON.parse(raw) : [];
        if (mounted && Array.isArray(arr)) setRemindedIds(new Set(arr));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [storageKey]);

  useEffect(() => {
    (async () => {
      try { await AsyncStorage.setItem(storageKey, JSON.stringify(Array.from(remindedIds))); } catch {}
    })();
  }, [remindedIds, storageKey]);

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
