import { CATALOG_NOTE } from "../data/catalog";
import { isQueryEmpty } from "../lib/query";
import { usePortal } from "../state/PortalState";
import { ObjectTable } from "./ObjectTable";
import { QueryFilters } from "./QueryFilters";

export function CatalogView() {
  const { catalog, filtered, query } = usePortal();
  const satellites = filtered.filter((object) => object.kind === "satellite").length;
  const debris = filtered.length - satellites;
  return (
    <section id="catalog-view" data-testid="catalog-view" className="view">
      <header className="page-header">
        <div>
          <h1 className="page-title">Space catalog</h1>
          <p className="lede">
            Satellites and debris in one catalog. Search and filters edit the shared query. Selecting a row updates the globe, conjunctions, and analytics.
          </p>
        </div>
      </header>
      <QueryFilters layout="toolbar" />
      <p className="result-line" data-testid="catalog-count">
        {filtered.length} of {catalog.length} objects
        <span> · {satellites} satellites · {debris} debris</span>
        {isQueryEmpty(query) ? null : <span> · query active</span>}
      </p>
      <ObjectTable objects={filtered} caption="Space catalog" />
      <p className="footnote">{CATALOG_NOTE}</p>
    </section>
  );
}
