import { lazy, Suspense, useMemo, useState } from "react";
import { formatKm, formatMinutes } from "../lib/format";
import { usePortal } from "../state/PortalState";
import type { ScenePair } from "./OrbitScene";

const OrbitScene = lazy(() => import("./OrbitScene").then((module) => ({ default: module.OrbitScene })));

export function VisualizationView() {
  const { filtered, selectedObjects, selection, conjunctions, activate, replaceSelection, toggleSelection, catalog } =
    usePortal();
  const reduceMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const [timeScale, setTimeScale] = useState(reduceMotion ? 0 : 240);

  const sceneObjects = useMemo(() => {
    const ids = new Set(filtered.map((object) => object.id));
    for (const object of selectedObjects) ids.add(object.id);
    return catalog.filter((object) => ids.has(object.id));
  }, [catalog, filtered, selectedObjects]);

  const outsideQuery = selectedObjects.filter((object) => !filtered.some((item) => item.id === object.id));

  const pairs = useMemo<ScenePair[]>(() => {
    const visible = new Set(sceneObjects.map((object) => object.id));
    return conjunctions
      .filter((item) => visible.has(item.primaryId) && visible.has(item.secondaryId))
      .filter((item) => selection.includes(item.primaryId) && selection.includes(item.secondaryId))
      .map((item) => ({ id: item.id, primaryId: item.primaryId, secondaryId: item.secondaryId }));
  }, [conjunctions, sceneObjects, selection]);

  const orderedIds = sceneObjects.map((object) => object.id);

  return (
    <section id="visualize-view" data-testid="visualize-view" className="view view--viz">
      <header className="page-header">
        <div>
          <h1 className="page-title">Orbit view</h1>
          <p className="lede">
            The same catalog, drawn to scale around Earth. Click an object to select it. Shift-click adds to the selection.
          </p>
        </div>
        <label className="field field--inline">
          <span>Time scale ×{timeScale}</span>
          <input
            className="time-slider"
            type="range"
            min={0}
            max={1200}
            step={20}
            value={timeScale}
            onChange={(event) => setTimeScale(Number(event.target.value))}
          />
        </label>
      </header>
      <div className="viz-layout">
        <Suspense fallback={<div className="viz-stage" data-testid="viz-canvas" data-webgl="loading">Loading orbit view…</div>}>
          <OrbitScene
            objects={sceneObjects}
            selectedIds={selection}
            pairs={pairs}
            timeScale={timeScale}
            onSelect={(id, toggle) => {
              if (toggle) toggleSelection(id);
              else replaceSelection([id]);
            }}
          />
        </Suspense>
        <aside className="panel viz-side">
          <h2 className="panel-title">In view</h2>
          <p className="muted" data-testid="viz-count">
            {sceneObjects.length} objects
            {outsideQuery.length > 0 ? ` · ${outsideQuery.length} selected outside the query` : ""}
          </p>
          {selectedObjects.length === 0 ? (
            <p data-testid="viz-empty-selection">Nothing selected. Choose an object here or in the catalog.</p>
          ) : (
            <ul className="selected-facts">
              {selectedObjects.slice(0, 4).map((object) => (
                <li key={object.id}>
                  <strong>{object.name}</strong>
                  <span>
                    {object.regime} · {formatKm(object.altitudeKm)} · {formatMinutes(object.periodMin)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <ul className="viz-list" data-testid="viz-list">
            {sceneObjects.length === 0 ? (
              <li className="muted">No objects match the active query.</li>
            ) : (
              sceneObjects.map((object) => {
                const selected = selection.includes(object.id);
                return (
                  <li key={object.id}>
                    <button
                      type="button"
                      className="viz-list-button"
                      aria-pressed={selected}
                      onClick={(event) => activate(object.id, orderedIds, event)}
                    >
                      <span className={`swatch swatch--${object.kind === "debris" ? "debris" : object.regime}`} />
                      <span>
                        <span className="viz-list-name">{object.name}</span>
                        <span className="muted">
                          {object.noradId} · {object.regime}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>
      </div>
    </section>
  );
}
