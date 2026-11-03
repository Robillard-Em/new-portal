export type OrbitRegime = "LEO" | "MEO" | "GEO" | "HEO";

export type ObjectKind = "satellite" | "debris";

export type ObjectStatus = "active" | "inactive" | "decayed";

export type ConjunctionPlan = "monitor" | "maneuver" | "cleared";

export interface SpaceObject {
  id: string;
  noradId: number;
  name: string;
  kind: ObjectKind;
  regime: OrbitRegime;
  country: string;
  status: ObjectStatus;
  /** Mean altitude, kilometres. */
  altitudeKm: number;
  perigeeKm: number;
  apogeeKm: number;
  inclinationDeg: number;
  /** Orbital period in minutes, derived from the semi-major axis. */
  periodMin: number;
  raanDeg: number;
  argPerigeeDeg: number;
  meanAnomalyDeg: number;
  eccentricity: number;
  launchYear: number;
}

export interface ActiveQuery {
  /** Matches name or NORAD id. Shared with the catalog search box. */
  search: string;
  name: string;
  noradId: string;
  regimes: OrbitRegime[];
  countries: string[];
  statuses: ObjectStatus[];
  kinds: ObjectKind[];
  altitudeMin: string;
  altitudeMax: string;
}

export interface Conjunction {
  id: string;
  primaryId: string;
  secondaryId: string;
  /** ISO-8601 time of closest approach. */
  tca: string;
  missDistanceKm: number;
  /** Estimated collision probability. Sample screening value. */
  probability: number;
  plan: ConjunctionPlan;
  summary: string;
}
