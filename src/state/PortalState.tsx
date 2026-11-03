import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { CATALOG } from "../data/catalog";
import { createConjunctions } from "../data/conjunctions";
import { emptyQuery, filterCatalog } from "../lib/query";
import type { ActiveQuery, Conjunction, ConjunctionPlan, SpaceObject } from "../types";

interface PortalContextValue {
  catalog: SpaceObject[];
  conjunctions: Conjunction[];
  selection: string[];
  selectedObjects: SpaceObject[];
  query: ActiveQuery;
  filtered: SpaceObject[];
  setQuery: (query: ActiveQuery | ((current: ActiveQuery) => ActiveQuery)) => void;
  patchQuery: (patch: Partial<ActiveQuery>) => void;
  resetQuery: () => void;
  replaceSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  toggleVisible: (visibleIds: string[], select: boolean) => void;
  activate: (id: string, orderedIds: string[], event: MouseEvent) => void;
  clearSelection: () => void;
  setPlan: (conjunctionId: string, plan: ConjunctionPlan) => void;
  objectById: (id: string) => SpaceObject | undefined;
}

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const catalog = CATALOG;
  const [conjunctions, setConjunctions] = useState<Conjunction[]>(createConjunctions);
  const [selection, setSelection] = useState<string[]>([]);
  const [query, setQueryState] = useState<ActiveQuery>(emptyQuery);
  const anchorRef = useRef<string | null>(null);

  const byId = useMemo(() => new Map(catalog.map((object) => [object.id, object])), [catalog]);

  const setQuery = useCallback((next: ActiveQuery | ((current: ActiveQuery) => ActiveQuery)) => {
    setQueryState((current) => (typeof next === "function" ? next(current) : next));
  }, []);

  const patchQuery = useCallback((patch: Partial<ActiveQuery>) => {
    setQueryState((current) => ({ ...current, ...patch }));
  }, []);

  const resetQuery = useCallback(() => {
    setQueryState(emptyQuery);
  }, []);

  const replaceSelection = useCallback((ids: string[]) => {
    const unique = Array.from(new Set(ids)).filter((id) => byId.has(id));
    anchorRef.current = unique[unique.length - 1] ?? null;
    setSelection(unique);
  }, [byId]);

  const toggleSelection = useCallback((id: string) => {
    if (!byId.has(id)) return;
    anchorRef.current = id;
    setSelection((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }, [byId]);

  const toggleVisible = useCallback((visibleIds: string[], select: boolean) => {
    const visible = new Set(visibleIds.filter((id) => byId.has(id)));
    setSelection((current) => {
      if (select) return Array.from(new Set([...current, ...visible]));
      return current.filter((id) => !visible.has(id));
    });
  }, [byId]);

  const addRange = useCallback((orderedIds: string[], toId: string) => {
    const from = anchorRef.current;
    anchorRef.current = toId;
    if (!from) {
      setSelection([toId]);
      return;
    }
    const start = orderedIds.indexOf(from);
    const end = orderedIds.indexOf(toId);
    if (start < 0 || end < 0) {
      setSelection([toId]);
      return;
    }
    const [lo, hi] = start < end ? [start, end] : [end, start];
    const range = orderedIds.slice(lo, hi + 1);
    setSelection((current) => Array.from(new Set([...current, ...range])));
  }, []);

  const activate = useCallback((id: string, orderedIds: string[], event: MouseEvent) => {
    if (event.shiftKey) {
      addRange(orderedIds, id);
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      toggleSelection(id);
      return;
    }
    replaceSelection([id]);
  }, [addRange, replaceSelection, toggleSelection]);

  const clearSelection = useCallback(() => {
    anchorRef.current = null;
    setSelection([]);
  }, []);

  const setPlan = useCallback((conjunctionId: string, plan: ConjunctionPlan) => {
    setConjunctions((current) =>
      current.map((item) => (item.id === conjunctionId ? { ...item, plan } : item)),
    );
  }, []);

  const objectById = useCallback((id: string) => byId.get(id), [byId]);

  const filtered = useMemo(() => filterCatalog(catalog, query), [catalog, query]);
  const selectedObjects = useMemo(
    () => selection.flatMap((id) => {
      const object = byId.get(id);
      return object ? [object] : [];
    }),
    [byId, selection],
  );

  const value = useMemo<PortalContextValue>(
    () => ({
      catalog,
      conjunctions,
      selection,
      selectedObjects,
      query,
      filtered,
      setQuery,
      patchQuery,
      resetQuery,
      replaceSelection,
      toggleSelection,
      toggleVisible,
      activate,
      clearSelection,
      setPlan,
      objectById,
    }),
    [
      catalog,
      conjunctions,
      selection,
      selectedObjects,
      query,
      filtered,
      setQuery,
      patchQuery,
      resetQuery,
      replaceSelection,
      toggleSelection,
      toggleVisible,
      activate,
      clearSelection,
      setPlan,
      objectById,
    ],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal(): PortalContextValue {
  const value = useContext(PortalContext);
  if (!value) throw new Error("usePortal must be used within PortalProvider");
  return value;
}
