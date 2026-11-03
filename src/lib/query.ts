import type { ActiveQuery, SpaceObject } from "../types";

export const emptyQuery: ActiveQuery = {
  search: "",
  name: "",
  noradId: "",
  regimes: [],
  countries: [],
  statuses: [],
  kinds: [],
  altitudeMin: "",
  altitudeMax: "",
};

export function isQueryEmpty(query: ActiveQuery): boolean {
  return (
    query.search.trim() === "" &&
    query.name.trim() === "" &&
    query.noradId.trim() === "" &&
    query.regimes.length === 0 &&
    query.countries.length === 0 &&
    query.statuses.length === 0 &&
    query.kinds.length === 0 &&
    query.altitudeMin.trim() === "" &&
    query.altitudeMax.trim() === ""
  );
}

export function altitudeRangeError(query: ActiveQuery): string | null {
  if (query.altitudeMin.trim() === "" || query.altitudeMax.trim() === "") return null;
  const min = Number(query.altitudeMin);
  const max = Number(query.altitudeMax);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "Altitude bounds must be numbers.";
  if (min > max) return "Minimum altitude is above the maximum.";
  return null;
}

export function matchesQuery(object: SpaceObject, query: ActiveQuery): boolean {
  const search = query.search.trim().toLowerCase();
  if (search) {
    const haystack = `${object.name} ${object.noradId}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  const name = query.name.trim().toLowerCase();
  if (name && !object.name.toLowerCase().includes(name)) return false;
  const norad = query.noradId.trim();
  if (norad && !String(object.noradId).includes(norad)) return false;
  if (query.regimes.length > 0 && !query.regimes.includes(object.regime)) return false;
  if (query.countries.length > 0 && !query.countries.includes(object.country)) return false;
  if (query.statuses.length > 0 && !query.statuses.includes(object.status)) return false;
  if (query.kinds.length > 0 && !query.kinds.includes(object.kind)) return false;

  if (!altitudeRangeError(query)) {
    if (query.altitudeMin.trim() !== "") {
      const min = Number(query.altitudeMin);
      if (Number.isFinite(min) && object.altitudeKm < min) return false;
    }
    if (query.altitudeMax.trim() !== "") {
      const max = Number(query.altitudeMax);
      if (Number.isFinite(max) && object.altitudeKm > max) return false;
    }
  }
  return true;
}

export function filterCatalog(catalog: SpaceObject[], query: ActiveQuery): SpaceObject[] {
  return catalog.filter((object) => matchesQuery(object, query));
}
