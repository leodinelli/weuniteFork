## Scope

This feature owns user and company profile surfaces on the web client in `apps/web/src/features/profile`.

## Responsibilities

- Render profile pages, edit flows, followers/following views, and profile-side search hooks.
- Hold profile and follow API adapters plus profile-local state and schemas.
- Coordinate profile presentation of posts and company opportunities without taking ownership of those backend domains.

## Does not own

- Backend user, follow, or opportunity business rules.
- Feed ownership of post creation and home ranking behavior.
- Shared layout primitives and global auth state.

## Key entrypoints

- `routes/ProfileRoutes.tsx`
- `pages/Profile.tsx`
- `api/userService.ts`
- `api/followerService.ts`
- `api/searchService.ts`
- `hooks/useUserProfile.ts`
- `hooks/useSearchUsers.ts`
- `hooks/useFollowAction.ts`
- `state/useUsers.ts`
- `state/useFollow.ts`
- `components/EditProfile.tsx`
- `components/HeaderProfile.tsx`

## Recent searches

- `state/recentSearchStack.ts` implements the reusable in-memory stack for recent profiles.
- `hooks/useRecentSearches.ts` synchronizes the stack with browser `localStorage`.
- Storage keys are scoped to the authenticated user: `weunite.search.recent.{userId}`.
- The web search panel stores at most 10 profiles and keeps the most recently opened profile at the top.
- This history is local to the browser and does not change API or database behavior.

## Validation

- `pnpm --filter @weunite/web lint`
- `pnpm --filter @weunite/web typecheck`
- `pnpm --filter @weunite/web build`

## Keep this file updated when

- Profile routes or major surfaces change.
- Follow or search ownership moves between profile and another feature.
- Profile edit boundaries shift between feature and shared code.
