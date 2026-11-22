import { useEffect, useState } from "react";
import { RecentSearchStack } from "@/features/profile/state/recentSearchStack";
import type { User } from "@/shared/types/user.types";

const STORAGE_PREFIX = "weunite.search.recent";

export function useRecentSearches(userId: string | null | undefined) {
  const storageKey = userId ? `${STORAGE_PREFIX}.${userId}` : null;
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!storageKey) {
      setRecentUsers([]);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? (JSON.parse(saved) as User[]) : [];
      setRecentUsers(RecentSearchStack.fromTopFirst(parsed).toArray());
    } catch {
      setRecentUsers([]);
    }
  }, [storageKey]);

  const save = (stack: RecentSearchStack<User>) => {
    const next = stack.toArray();
    setRecentUsers(next);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  const addRecent = (user: User) => {
    if (!storageKey) return;

    const stack = RecentSearchStack.fromTopFirst(recentUsers);
    const existing = stack.toArray().find((item) => item.id === user.id);
    if (existing) stack.remove(existing);
    stack.push(user);
    save(stack);
  };

  const removeRecent = (userIdToRemove: string) => {
    if (!storageKey) return;

    const stack = RecentSearchStack.fromTopFirst(recentUsers);
    const item = stack.toArray().find((user) => user.id === userIdToRemove);
    if (item) stack.remove(item);
    save(stack);
  };

  const clearRecent = () => {
    if (!storageKey) return;

    const stack = RecentSearchStack.fromTopFirst(recentUsers);
    stack.clear();
    save(stack);
  };

  return { recentUsers, addRecent, removeRecent, clearRecent };
}
