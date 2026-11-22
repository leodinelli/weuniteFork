import { useCallback, useEffect, useState } from "react";
import { RecentSearchStack } from "@/features/profile/state/recentSearchStack";

/** Dados mínimos de um perfil guardados no histórico de pesquisas. */
export interface RecentSearchUser {
  username: string;
  name: string;
  profileImg?: string;
}

/** Quantas pesquisas recentes ficam guardadas na pilha. */
export const RECENT_SEARCHES_CAPACITY = 10;

const getStorageKey = (userId?: string) =>
  userId ? `weunite.search.recent.${userId}` : null;

// O username é único, então serve como chave para evitar duplicados.
const getKey = (user: RecentSearchUser) => user.username;

const isRecentSearchUser = (value: unknown): value is RecentSearchUser => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.username === "string" &&
    typeof candidate.name === "string" &&
    (candidate.profileImg === undefined ||
      candidate.profileImg === null ||
      typeof candidate.profileImg === "string")
  );
};

const readFromStorage = (storageKey: string | null): RecentSearchUser[] => {
  if (!storageKey || typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isRecentSearchUser) : [];
  } catch {
    return [];
  }
};

const writeToStorage = (
  storageKey: string | null,
  items: RecentSearchUser[],
) => {
  if (!storageKey || typeof window === "undefined") {
    return;
  }
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    }
  } catch {
    // Sem localStorage (modo privado, cota cheia): o histórico fica só em memória.
  }
};

/**
 * Histórico de pesquisas de perfis do usuário logado, guardado numa Pilha.
 * A lista devolvida já vem do topo para a base (mais recente primeiro).
 * Cada usuário logado tem o seu próprio histórico no navegador.
 */
export function useRecentSearches(userId?: string) {
  const storageKey = getStorageKey(userId);
  const [recentSearches, setRecentSearches] = useState<RecentSearchUser[]>(() =>
    readFromStorage(storageKey),
  );

  // Recarrega quando outro usuário faz login no mesmo navegador.
  useEffect(() => {
    setRecentSearches(readFromStorage(storageKey));
  }, [storageKey]);

  // Monta a pilha a partir do estado atual, aplica a operação e salva.
  const update = useCallback(
    (operation: (stack: RecentSearchStack<RecentSearchUser>) => void) => {
      const stack = RecentSearchStack.fromTopFirst(
        recentSearches,
        RECENT_SEARCHES_CAPACITY,
        getKey,
      );
      operation(stack);
      const next = stack.toArray();
      setRecentSearches(next);
      writeToStorage(storageKey, next);
    },
    [recentSearches, storageKey],
  );

  const addRecentSearch = useCallback(
    (user: RecentSearchUser) =>
      update((stack) =>
        stack.push({
          username: user.username,
          name: user.name,
          // A API pode mandar null quando o perfil não tem foto.
          profileImg: user.profileImg ?? undefined,
        }),
      ),
    [update],
  );

  const removeRecentSearch = useCallback(
    (username: string) => update((stack) => stack.remove(username)),
    [update],
  );

  const clearRecentSearches = useCallback(
    () => update((stack) => stack.clear()),
    [update],
  );

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
