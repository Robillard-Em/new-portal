import { useEffect, useMemo, useState } from "react";
import { formatDegrees, formatKm, formatMinutes } from "../lib/format";
import { usePortal } from "../state/PortalState";
import type { SpaceObject } from "../types";

type SortKey = "name" | "noradId" | "kind" | "regime" | "country" | "status" | "altitudeKm" | "periodMin" | "inclinationDeg";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "noradId", label: "NORAD" },
  { key: "kind", label: "Kind" },
  { key: "regime", label: "Regime" },
  { key: "country", label: "Country" },
  { key: "status", label: "Status" },
  { key: "altitudeKm", label: "Altitude" },
  { key: "periodMin", label: "Period" },
  { key: "inclinationDeg", label: "Inclination" },
];

function compare(left: SpaceObject, right: SpaceObject, key: SortKey): number {
  const a = left[key];
  const b = right[key];
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function ObjectTable({ objects, caption }: { objects: SpaceObject[]; caption: string }) {
  const { selection, activate, toggleSelection, toggleVisible } = usePortal();
  const [sort, setSort] = useState<SortKey>("name");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const next = [...objects].sort((a, b) => compare(a, b, sort));
    return direction === "asc" ? next : next.reverse();
  }, [direction, objects, sort]);

  const orderedIds = sorted.map((object) => object.id);
  const selectedVisible = orderedIds.filter((id) => selection.includes(id)).length;
  const allSelected = orderedIds.length > 0 && selectedVisible === orderedIds.length;
  const someSelected = selectedVisible > 0 && !allSelected;

  function onSort(key: SortKey) {
    if (key === sort) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSort(key);
    setDirection(key === "name" || key === "country" || key === "kind" || key === "regime" || key === "status" ? "asc" : "desc");
  }

  return (
    <div className="table-scroll">
      <table className="object-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th className="check-cell">
              <SelectAll
                checked={allSelected}
                indeterminate={someSelected}
                disabled={orderedIds.length === 0}
                onChange={(checked) => toggleVisible(orderedIds, checked)}
              />
            </th>
            {COLUMNS.map((column) => (
              <th key={column.key} aria-sort={sort === column.key ? (direction === "asc" ? "ascending" : "descending") : "none"}>
                <button type="button" className="table-sort" onClick={() => onSort(column.key)}>
                  {column.label}
                  {sort === column.key ? <span aria-hidden="true">{direction === "asc" ? " ↑" : " ↓"}</span> : null}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="table-empty">
                No catalog objects match this query.
              </td>
            </tr>
          ) : (
            sorted.map((object) => {
              const selected = selection.includes(object.id);
              return (
                <tr
                  key={object.id}
                  data-selected={selected ? "true" : "false"}
                  data-kind={object.kind}
                  onClick={(event) => activate(object.id, orderedIds, event)}
                >
                  <td className="check-cell" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected}
                      aria-label={`Select ${object.name}`}
                      onChange={() => toggleSelection(object.id)}
                    />
                  </td>
                  <td>
                    <span className={object.kind === "debris" ? "name name--debris" : "name"}>{object.name}</span>
                  </td>
                  <td className="numeric">{object.noradId}</td>
                  <td className="capitalize">{object.kind}</td>
                  <td>{object.regime}</td>
                  <td>{object.country}</td>
                  <td>
                    <StatusText status={object.status} />
                  </td>
                  <td className="numeric">{formatKm(object.altitudeKm, object.altitudeKm >= 1000 ? 0 : 0)}</td>
                  <td className="numeric">{formatMinutes(object.periodMin)}</td>
                  <td className="numeric">{formatDegrees(object.inclinationDeg)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function SelectAll({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  const [node, setNode] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (node) node.indeterminate = indeterminate;
  }, [indeterminate, node]);

  return (
    <input
      ref={setNode}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={checked ? "Clear visible selection" : "Select all visible objects"}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

function StatusText({ status }: { status: SpaceObject["status"] }) {
  return <span className={`status-text status-text--${status}`}>{status}</span>;
}
