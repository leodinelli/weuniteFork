import { Input } from "@/shared/components/ui/input";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchUsers } from "@/features/profile/hooks/useSearchUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getInitials } from "@/shared/utils/getInitials";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  useRecentSearches,
  type RecentSearchUser,
} from "@/features/profile/hooks/useRecentSearches";

function SearchUserRow({
  user,
  onSelect,
  onRemove,
}: {
  user: RecentSearchUser;
  onSelect: (user: RecentSearchUser) => void;
  onRemove?: (username: string) => void;
}) {
  const userName = user.name || "Usuário desconhecido";

  return (
    <div
      className="flex items-center justify-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
      onClick={() => onSelect(user)}
    >
      <Avatar className="h-[2.8em] w-[2.8em]">
        <AvatarImage
          src={user.profileImg}
          alt={userName}
          className="aspect-square h-full w-full rounded-full object-cover"
        />
        <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{userName}</p>
        <p className="text-xs text-muted-foreground truncate">
          @{user.username}
        </p>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(user.username);
          }}
          className="p-1 rounded-full hover:bg-background transition-colors"
          aria-label={`Remover ${userName} das pesquisas recentes`}
        >
          <X className="h-4 w-4 text-muted-foreground hover:cursor-pointer" />
        </button>
      )}
    </div>
  );
}

export function Search({
  isOpen = false,
  onOpenChange,
}: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useSearchUsers(searchQuery);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useRecentSearches(currentUserId ? String(currentUserId) : undefined);

  const handleUserClick = (user: RecentSearchUser) => {
    // Empilha o perfil aberto no topo da pilha de pesquisas recentes.
    addRecentSearch(user);
    navigate(`/profile/${user.username}`);
    handleOpenChange(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (onOpenChange) {
      setOpen(isOpen);
    }

    if (isOpen || (!onOpenChange && open)) {
      setShouldRender(true);
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onOpenChange, open]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const isCurrentlyOpen = onOpenChange ? isOpen : open;
  if (!shouldRender) return null;

  return (
    <>
      <div
        className={`fixed top-0 bottom-0 z-40 pointer-events-auto bg-card border-r border-border shadow-lg ${
          isAnimating
            ? "animate-out slide-out-to-left"
            : "animate-in slide-in-from-left"
        } duration-500`}
        style={{
          left: "5rem",
          width: "320px",
        }}
        onAnimationEnd={() => {
          if (isAnimating && !isCurrentlyOpen) {
            setShouldRender(false);
          }
        }}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pesquisar</h2>
            <button
              onClick={() => handleOpenChange(false)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Fechar pesquisa"
            >
              <X className="h-5 w-5 hover:cursor-pointer" />
            </button>
          </div>
          <Input
            placeholder="Pesquisa por..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="mb-4"></div>

          <div className="flex-1 overflow-y-auto">
            {searchQuery.length === 0 && recentSearches.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Digite para começar a pesquisar...
              </p>
            )}

            {searchQuery.length === 0 && recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Recentes</h3>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-xs font-medium text-primary hover:underline hover:cursor-pointer"
                  >
                    Limpar tudo
                  </button>
                </div>
                {recentSearches.map((user) => (
                  <SearchUserRow
                    key={user.username}
                    user={user}
                    onSelect={handleUserClick}
                    onRemove={removeRecentSearch}
                  />
                ))}
              </div>
            )}

            {searchQuery.length > 0 && isLoading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length > 0 && !isLoading && error && (
              <p className="text-sm text-red-500">
                Erro ao buscar usuários. Tente novamente.
              </p>
            )}

            {searchQuery.length > 0 &&
              !isLoading &&
              users &&
              Array.isArray(users) &&
              users.filter((user) => user.id !== String(currentUserId))
                .length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum usuário encontrado para "{searchQuery}"
                </p>
              )}

            {searchQuery.length > 0 &&
              !isLoading &&
              users &&
              Array.isArray(users) &&
              users.filter((user) => user.id !== String(currentUserId)).length >
                0 && (
                <div className="space-y-2">
                  {users
                    .filter((user) => user.id !== String(currentUserId))
                    .map((user) => (
                      <SearchUserRow
                        key={user.id ?? user.username}
                        user={user}
                        onSelect={handleUserClick}
                      />
                    ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
