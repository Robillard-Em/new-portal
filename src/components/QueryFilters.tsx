import { useMemo } from "react";
import { altitudeRangeError, isQueryEmpty } from "../lib/query";
import { usePortal } from "../state/PortalState";
import type { ObjectKind, ObjectStatus, OrbitRegime } from "../types";

const REGIMES: OrbitRegime[] = ["LEO", "MEO", "GEO", "HEO"];
const STATUSES: ObjectStatus[] = ["active", "inactive", "decayed"];
const KINDS: ObjectKind[] = ["satellite", "debris"];

export function QueryFilters({ layout }: { layout: "toolbar" | "form" }) {
  const { catalog, query, patchQuery, resetQuery, setQuery } = usePortal();
  const countries = useMemo(
    () => Array.from(new Set(catalog.map((object) => object.country))).sort((a, b) => a.localeCompare(b)),
    [catalog],
  );
  const rangeError = altitudeRangeError(query);

  function toggleList<T extends string>(key: "regimes" | "countries" | "statuses" | "kinds", value: T) {
    setQuery((current) => {
      const list = current[key] as T[];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [key]: next };
    });
  }

  return (
    <form
      className={layout === "form" ? "filters filters--form" : "filters"}
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="field">
        <span>Quick search</span>
        <input
          data-testid="catalog-search"
          type="search"
          value={query.search}
          placeholder="Name or NORAD"
          onChange={(event) => patchQuery({ search: event.target.value })}
        />
      </label>
      {layout === "form" ? (
        <>
          <label className="field">
            <span>Name contains</span>
            <input
              data-testid="query-name"
              type="text"
              value={query.name}
              placeholder="Hubble, Starlink, GOES"
              onChange={(event) => patchQuery({ name: event.target.value })}
            />
          </label>
          <label className="field">
            <span>NORAD or id contains</span>
            <input
              data-testid="query-norad"
              inputMode="numeric"
              value={query.noradId}
              placeholder="25544"
              onChange={(event) => patchQuery({ noradId: event.target.value })}
            />
          </label>
        </>
      ) : null}

      <fieldset className="choice-set">
        <legend>Orbit regime</legend>
        <div className="chip-row">
          {REGIMES.map((regime) => (
            <button
              key={regime}
              type="button"
              className="chip"
              aria-pressed={query.regimes.includes(regime)}
              onClick={() => toggleList("regimes", regime)}
            >
              {regime}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="choice-set">
        <legend>Status</legend>
        <div className="chip-row">
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className="chip"
              aria-pressed={query.statuses.includes(status)}
              onClick={() => toggleList("statuses", status)}
            >
              {status}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="choice-set">
        <legend>Kind</legend>
        <div className="chip-row">
          {KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              className="chip"
              aria-pressed={query.kinds.includes(kind)}
              onClick={() => toggleList("kinds", kind)}
            >
              {kind}
            </button>
          ))}
        </div>
      </fieldset>

      <AltitudeAndCountry
        layout={layout}
        countries={countries}
        queryMin={query.altitudeMin}
        queryMax={query.altitudeMax}
        selectedCountries={query.countries}
        rangeError={rangeError}
        onMin={(value) => patchQuery({ altitudeMin: value })}
        onMax={(value) => patchQuery({ altitudeMax: value })}
        onCountry={(country) => toggleList("countries", country)}
      />

      <div className="filter-actions">
        <button type="button" className="button button-secondary button--small" onClick={resetQuery} disabled={isQueryEmpty(query)}>
          Clear query
        </button>
      </div>
    </form>
  );
}

function AltitudeAndCountry({
  layout,
  countries,
  queryMin,
  queryMax,
  selectedCountries,
  rangeError,
  onMin,
  onMax,
  onCountry,
}: {
  layout: "toolbar" | "form";
  countries: string[];
  queryMin: string;
  queryMax: string;
  selectedCountries: string[];
  rangeError: string | null;
  onMin: (value: string) => void;
  onMax: (value: string) => void;
  onCountry: (country: string) => void;
}) {
  const fields = (
    <>
      <div className="altitude-fields">
        <label className="field">
          <span>Altitude min (km)</span>
          <input data-testid="altitude-min" inputMode="decimal" value={queryMin} onChange={(event) => onMin(event.target.value)} />
        </label>
        <label className="field">
          <span>Altitude max (km)</span>
          <input data-testid="altitude-max" inputMode="decimal" value={queryMax} onChange={(event) => onMax(event.target.value)} />
        </label>
      </div>
      {rangeError ? (
        <p className="field-error" data-testid="altitude-error" role="alert">
          {rangeError}
        </p>
      ) : null}
      <fieldset className="choice-set">
        <legend>Country</legend>
        <div className="check-grid">
          {countries.map((country) => (
            <label key={country} className="check-label">
              <input type="checkbox" checked={selectedCountries.includes(country)} onChange={() => onCountry(country)} />
              <span>{country}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );

  if (layout === "toolbar") {
    return (
      <details className="more-filters">
        <summary>Altitude and country</summary>
        {fields}
      </details>
    );
  }
  return fields;
}
