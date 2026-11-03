import { isQueryEmpty } from "../lib/query";
import { usePortal } from "../state/PortalState";
import { ObjectTable } from "./ObjectTable";
import { QueryFilters } from "./QueryFilters";

export function QueryBuilderView() {
  const { catalog, filtered, query, replaceSelection } = usePortal();
  return (
    <section id="query-view" data-testid="query-view" className="view">
      <header className="page-header">
        <div>
          <h1 className="page-title">Query builder</h1>
          <p className="lede">
            Build a query against the shared catalog. Name, NORAD, regime, country, status, and altitude all narrow the same result set the catalog and globe use.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary button--small"
          disabled={filtered.length === 0}
          onClick={() => replaceSelection(filtered.map((object) => object.id))}
        >
          Select results
        </button>
      </header>
      <div className="split">
        <div className="panel">
          <h2 className="panel-title">Filters</h2>
          <QueryFilters layout="form" />
        </div>
        <div>
          <p className="result-line" data-testid="query-count">
            {filtered.length} of {catalog.length} match
            {isQueryEmpty(query) ? " · no filters yet" : ""}
          </p>
          <ObjectTable objects={filtered} caption="Query results" />
        </div>
      </div>
    </section>
  );
}
