# Page UI State In Feature-Local Hooks

**Impact: MEDIUM**

Default page UI state lives in feature-local hooks using `useState`/`useReducer`, scoped to the route segment that owns the UI. Avoid a global client store for state that belongs to one page.

Good cases for `useState`/`useReducer` in `_internal/hooks/use<Feature>UiState.ts`:

- selected rows, drawer/modal open state, multi-panel coordination inside one route, local sort/view mode not stored in URL.

Reach for an external store (Zustand, Context with selectors) only when one of these holds:

- the same UI state must be readable by multiple sibling routes
- a deeply nested client tree needs the state without prop drilling and Context re-renders are problematic
- you need devtools, persistence, or selectors plain hooks cannot provide

Do not store: server data, form drafts, auth/session authority, or data shareable via URL.

**Incorrect (Zustand for state owned by one route):**

```ts
const useWorkItemsUiStore = create(() => ({
  selectedIds: new Set<string>(),
  drawerOpened: false,
}));
```

**Correct (feature-local hook):**

```ts
type State = { selectedIds: Set<string>; drawerOpened: boolean };
type Action = { type: "select"; id: string } | { type: "toggleDrawer" };

export function useWorkItemsUiState() {
  return useReducer(reducer, { selectedIds: new Set(), drawerOpened: false });
}
```

Reference: React state placement and server-state separation.
