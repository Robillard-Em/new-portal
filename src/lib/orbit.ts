import type { SpaceObject } from "../types";

export const EARTH_RADIUS_KM = 6371;
const MU_KM3_S2 = 398600.4418;

export function elementsFromAltitudes(perigeeKm: number, apogeeKm: number): {
  altitudeKm: number;
  eccentricity: number;
  periodMin: number;
  semiMajorKm: number;
} {
  const rp = EARTH_RADIUS_KM + perigeeKm;
  const ra = EARTH_RADIUS_KM + apogeeKm;
  const semiMajorKm = (rp + ra) / 2;
  const eccentricity = semiMajorKm === 0 ? 0 : (ra - rp) / (ra + rp);
  const periodSec = 2 * Math.PI * Math.sqrt(semiMajorKm ** 3 / MU_KM3_S2);
  return {
    altitudeKm: (perigeeKm + apogeeKm) / 2,
    eccentricity,
    periodMin: periodSec / 60,
    semiMajorKm,
  };
}

export interface ScenePoint {
  x: number;
  y: number;
  z: number;
}

/**
 * ECI position scaled so Earth's radius is 1. Y is up (north).
 * `simMs` is milliseconds since the catalog epoch.
 */
export function scenePosition(object: SpaceObject, simMs: number): ScenePoint {
  const rp = EARTH_RADIUS_KM + object.perigeeKm;
  const ra = EARTH_RADIUS_KM + object.apogeeKm;
  const a = (rp + ra) / 2;
  const e = object.eccentricity;
  const periodMs = object.periodMin * 60 * 1000;
  const mean0 = (object.meanAnomalyDeg * Math.PI) / 180;
  const mean = mean0 + (2 * Math.PI * simMs) / periodMs;
  let E = mean;
  for (let i = 0; i < 8; i += 1) {
    const f = E - e * Math.sin(E) - mean;
    const fp = 1 - e * Math.cos(E);
    E -= f / fp;
  }
  const xPerifocal = a * (Math.cos(E) - e);
  const yPerifocal = a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E);

  const omega = (object.argPerigeeDeg * Math.PI) / 180;
  const inc = (object.inclinationDeg * Math.PI) / 180;
  const raan = (object.raanDeg * Math.PI) / 180;
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);
  const x1 = xPerifocal * cosW - yPerifocal * sinW;
  const y1 = xPerifocal * sinW + yPerifocal * cosW;
  const cosi = Math.cos(inc);
  const sini = Math.sin(inc);
  const y2 = y1 * cosi;
  const z2 = y1 * sini;
  const cosO = Math.cos(raan);
  const sinO = Math.sin(raan);
  const x = x1 * cosO - y2 * sinO;
  const y = x1 * sinO + y2 * cosO;
  const z = z2;
  const scale = 1 / EARTH_RADIUS_KM;
  return { x: x * scale, y: z * scale, z: -y * scale };
}

export function orbitPolyline(object: SpaceObject, samples = 160): ScenePoint[] {
  const periodMs = object.periodMin * 60 * 1000;
  const points: ScenePoint[] = [];
  for (let i = 0; i <= samples; i += 1) {
    points.push(scenePosition(object, (i / samples) * periodMs));
  }
  return points;
}
