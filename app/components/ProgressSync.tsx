"use client";
import { useEffect } from "react";
import { useUser } from "@/lib/supabase";
import { startProgressSync } from "@/lib/progress-sync";
import { startExamHistorySync } from "@/lib/exam-history-sync";

// Invisible: mounts the cross-device progress + exam-history sync whenever a
// user is signed in. Rendered once from the root layout.
export default function ProgressSync() {
  const { user } = useUser();
  useEffect(() => {
    if (!user) return;
    const stopProgress = startProgressSync(user.id);
    const stopExamHistory = startExamHistorySync(user.id);
    return () => { stopProgress(); stopExamHistory(); };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
