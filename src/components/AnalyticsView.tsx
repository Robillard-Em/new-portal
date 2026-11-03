import { Link } from "react-router-dom";
import { formatDegrees, formatKm, formatMinutes, mean, median } from "../lib/format";
import { usePortal } from "../state/PortalState";
import type { Conjunction, SpaceObject } from "../types";
import { BarChart, Donut, Histogram, colorForIndex, slicesFromCounts } from "./Charts";

export function AnalyticsView() {
  const { catalog, selectedObjects, conjunctions, replaceSelection, clearSelection } = usePortal();

  const involved = conjunctions.filter(
    (item) =>
      selectedObjects.some((object) => object.id === item.primaryId || object.id === item.secondaryId),
  );

  return (
    <section id="analytics-view" data-testid="analytics-view" className="view">
      <header className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="lede">
            Charts for the shared selection. One object is compared with the catalog. Several objects are compared with each other.
          </p>
        </div>
        {selectedObjects.length > 0 ? (
          <button type="button" className="button button-secondary button--small" onClick={clearSelection}>
            Clear selection
          </button>
        ) : null}
      </header>

      {selectedObjects.length === 0 ? (
        <EmptyAnalytics
          onIss={() => replaceSelection(["25544"])}
          onGnss={() => replaceSelection(["43873", "44506", "45854", "40315", "37846", "43001"])}
        />
      ) : selectedObjects.length === 1 ? (
        <SingleAnalytics object={selectedObjects[0]} catalog={catalog} involved={involved} />
      ) : (
        <MultiAnalytics objects={selectedObjects} involved={involved} />
      )}
    </section>
  );
}

function EmptyAnalytics({ onIss, onGnss }: { onIss: () => void; onGnss: () => void }) {
  return (
    <div className="panel empty-panel" data-testid="analytics-empty">
      <h2 className="panel-title">No objects selected</h2>
      <p>Select one object for a catalog comparison, or several to compare altitude, period, inclination, country, regime, and conjunction involvement.</p>
      <div className="filter-actions">
        <button type="button" className="button button-primary" onClick={onIss}>
          Select ISS
        </button>
        <button type="button" className="button button-secondary" onClick={onGnss}>
          Compare navigation satellites
        </button>
        <Link className="button button-tertiary" to="/">
          Browse catalog
        </Link>
      </div>
    </div>
  );
}

function SingleAnalytics({
  object,
  catalog,
  involved,
}: {
  object: SpaceObject;
  catalog: SpaceObject[];
  involved: Conjunction[];
}) {
  return (
    <div data-testid="analytics-single">
      <div className="identity">
        <h2 className="panel-title">{object.name}</h2>
        <p className="muted">
          NORAD {object.noradId} · {object.country} · {object.kind} · {object.status} · launched {object.launchYear}
        </p>
      </div>
      <div className="stat-row">
        <Fact label="Altitude" value={formatKm(object.altitudeKm)} />
        <Fact label="Period" value={formatMinutes(object.periodMin)} />
        <Fact label="Inclination" value={formatDegrees(object.inclinationDeg)} />
        <Fact label="Eccentricity" value={object.eccentricity.toFixed(4)} />
        <Fact label="Perigee" value={formatKm(object.perigeeKm)} />
        <Fact label="Apogee" value={formatKm(object.apogeeKm)} />
      </div>
      <div className="chart-grid">
        <RangeChart label="Altitude" unit="km" value={object.altitudeKm} values={catalog.map((item) => item.altitudeKm)} />
        <RangeChart label="Period" unit="min" value={object.periodMin} values={catalog.map((item) => item.periodMin)} />
        <RangeChart label="Inclination" unit="°" value={object.inclinationDeg} values={catalog.map((item) => item.inclinationDeg)} />
        <Donut title="Country mix" slices={slicesFromCounts(countBy([object], (item) => item.country))} />
        <Donut title="Regime mix" slices={slicesFromCounts(countBy([object], (item) => item.regime))} />
        <ConjunctionCard involved={involved} />
      </div>
    </div>
  );
}

function MultiAnalytics({ objects, involved }: { objects: SpaceObject[]; involved: Conjunction[] }) {
  const detailed = objects.length <= 8;
  const rows = objects.map((object, index) => ({
    id: object.id,
    label: object.name,
    color: colorForIndex(index),
  }));
  return (
    <div data-testid="analytics-multi">
      <div className="stat-row">
        <Fact label="Objects" value={String(objects.length)} />
        <Fact label="Mean altitude" value={formatKm(mean(objects.map((object) => object.altitudeKm)))} />
        <Fact label="Median period" value={formatMinutes(median(objects.map((object) => object.periodMin)))} />
        <Fact label="Conjunctions" value={String(involved.length)} />
      </div>
      <div className="chart-grid">
        {detailed ? (
          <>
            <BarChart
              title="Altitude"
              unit="km"
              rows={rows.map((row, index) => ({ ...row, value: objects[index].altitudeKm }))}
            />
            <BarChart
              title="Period"
              unit="min"
              rows={rows.map((row, index) => ({ ...row, value: objects[index].periodMin }))}
            />
            <BarChart
              title="Inclination"
              unit="°"
              rows={rows.map((row, index) => ({ ...row, value: objects[index].inclinationDeg }))}
            />
          </>
        ) : (
          <>
            <Histogram title="Altitude" unit="km" values={objects.map((object) => object.altitudeKm)} />
            <Histogram title="Period" unit="min" values={objects.map((object) => object.periodMin)} />
            <Histogram title="Inclination" unit="°" values={objects.map((object) => object.inclinationDeg)} />
          </>
        )}
        <Donut title="Country mix" slices={slicesFromCounts(countBy(objects, (object) => object.country))} />
        <Donut title="Regime mix" slices={slicesFromCounts(countBy(objects, (object) => object.regime))} />
        <ConjunctionCard involved={involved} />
      </div>
    </div>
  );
}

function RangeChart({
  label,
  unit,
  value,
  values,
}: {
  label: string;
  unit: string;
  value: number;
  values: number[];
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mid = median(values);
  const span = max - min || 1;
  const at = (point: number) => `${((point - min) / span) * 100}%`;
  return (
    <figure className="chart-card">
      <figcaption>
        {label} <span className="muted">against the catalog</span>
      </figcaption>
      <p className="range-readout">
        {value.toLocaleString("en-US", { maximumFractionDigits: 1 })} {unit}
      </p>
      <div className="range-track" aria-hidden="true">
        <span className="range-median" style={{ left: at(mid) }} />
        <span className="range-value" style={{ left: at(value) }} />
      </div>
      <div className="range-scale">
        <span>min {min.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
        <span>median</span>
        <span>max {max.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
      </div>
    </figure>
  );
}

function ConjunctionCard({ involved }: { involved: Conjunction[] }) {
  const { objectById, replaceSelection } = usePortal();
  return (
    <figure className="chart-card">
      <figcaption>Conjunction involvement</figcaption>
      {involved.length === 0 ? (
        <p className="muted">None of the selected objects are in the screening set.</p>
      ) : (
        <ul className="involve-list">
          {involved.map((item) => {
            const primary = objectById(item.primaryId);
            const secondary = objectById(item.secondaryId);
            return (
              <li key={item.id}>
                <button type="button" className="linkish" onClick={() => replaceSelection([item.primaryId, item.secondaryId])}>
                  {primary?.name ?? item.primaryId} · {secondary?.name ?? item.secondaryId}
                </button>
                <span className={`plan-pill plan-pill--${item.plan}`}>{item.plan}</span>
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat-value stat-value--text">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function countBy(objects: SpaceObject[], key: (object: SpaceObject) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const object of objects) {
    const label = key(object);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return counts;
}
