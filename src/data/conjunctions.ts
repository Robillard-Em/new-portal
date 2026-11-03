import type { Conjunction, ConjunctionPlan } from "../types";

const sessionStart = Date.now();

function hoursFromNow(hours: number): string {
  return new Date(sessionStart + hours * 3_600_000).toISOString();
}

function event(
  id: string,
  primaryId: number,
  secondaryId: number,
  hours: number,
  missDistanceKm: number,
  probability: number,
  plan: ConjunctionPlan,
  summary: string,
): Conjunction {
  return {
    id,
    primaryId: String(primaryId),
    secondaryId: String(secondaryId),
    tca: hoursFromNow(hours),
    missDistanceKm,
    probability,
    plan,
    summary,
  };
}

/** Sample screening events between catalog objects. Times are relative to page load so they stay upcoming. */
export function createConjunctions(): Conjunction[] {
  return [
    event(
      "iss-frag",
      25544,
      49008,
      8,
      0.42,
      2.4e-4,
      "maneuver",
      "Station-altitude fragment. Avoidance option drafted for the next reboost window.",
    ),
    event(
      "starlink-pair",
      44713,
      47366,
      14,
      0.78,
      8.1e-5,
      "monitor",
      "Same-shell Starlink pair. Screening remains inside the watch threshold.",
    ),
    event(
      "fy1c-noaa20",
      30690,
      43013,
      26,
      0.33,
      1.1e-3,
      "maneuver",
      "Fengyun-1C fragment versus NOAA 20. Maneuver plan is in review.",
    ),
    event(
      "c2251-iridium33",
      33918,
      33773,
      36,
      0.15,
      4.6e-4,
      "monitor",
      "Debris-on-debris from the 2009 collision. No active spacecraft to maneuver.",
    ),
    event(
      "terra-aqua",
      25994,
      27424,
      72,
      9.6,
      1e-7,
      "cleared",
      "A-Train geometry. Miss distance holds; event cleared by screening.",
    ),
    event(
      "s2a-landsat9",
      40697,
      49260,
      22,
      2.4,
      3e-6,
      "monitor",
      "Morning SSO pair. Keep the event on the daily board.",
    ),
    event(
      "gps-pair",
      43873,
      44506,
      96,
      22,
      2e-8,
      "cleared",
      "Co-planar GPS III pair. Along-track separation is acceptable.",
    ),
    event(
      "goes-pair",
      41866,
      51850,
      28,
      86,
      1e-9,
      "cleared",
      "GEO slot-keeping watch. Both vehicles remain inside their boxes.",
    ),
    event(
      "iridium-next",
      42803,
      42955,
      16,
      1.2,
      6.4e-5,
      "maneuver",
      "Iridium NEXT plane-mates. A small station-keeping burn is planned.",
    ),
    event(
      "envisat-delta",
      27386,
      22077,
      11,
      0.62,
      3.3e-4,
      "monitor",
      "Inactive Envisat versus a Delta rocket body. No maneuvering asset.",
    ),
    event(
      "starlink-f9",
      48215,
      43600,
      5,
      0.51,
      5.2e-4,
      "maneuver",
      "Starlink versus a Falcon 9 fragment in a nearby shell.",
    ),
  ];
}
