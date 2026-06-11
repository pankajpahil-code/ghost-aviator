"use client";
import { useEffect } from "react";
import { useUser } from "@/lib/supabase";
import { startProgressSync } from "@/lib/progress-sync";

// Invisible: mounts the cross-device progress sync whenever a user is
// signed in. Rendered once from the root layout.
export default function ProgressSync() {
  const { user } = useUser();
  useEffect(() => {
    if (!user) return;
    return startProgressSync(user.id);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
