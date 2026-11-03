import { elementsFromAltitudes } from "../lib/orbit";
import type { ObjectKind, ObjectStatus, OrbitRegime, SpaceObject } from "../types";

/**
 * Representative public-class elements for a local sample catalog.
 * Period and eccentricity are derived so every view stays consistent.
 * This is not a live space-track feed.
 */
interface RawSeed {
  noradId: number;
  name: string;
  kind: ObjectKind;
  regime: OrbitRegime;
  country: string;
  status: ObjectStatus;
  perigeeKm: number;
  apogeeKm: number;
  inclinationDeg: number;
  raanDeg: number;
  argPerigeeDeg: number;
  meanAnomalyDeg: number;
  launchYear: number;
}

function seed(
  noradId: number,
  name: string,
  kind: ObjectKind,
  regime: OrbitRegime,
  country: string,
  status: ObjectStatus,
  perigeeKm: number,
  apogeeKm: number,
  inclinationDeg: number,
  raanDeg: number,
  meanAnomalyDeg: number,
  launchYear: number,
  argPerigeeDeg = 90,
): RawSeed {
  return {
    noradId,
    name,
    kind,
    regime,
    country,
    status,
    perigeeKm,
    apogeeKm,
    inclinationDeg,
    raanDeg,
    argPerigeeDeg,
    meanAnomalyDeg,
    launchYear,
  };
}

const SEEDS: RawSeed[] = [
  seed(25544, "ISS (ZARYA)", "satellite", "LEO", "International", "active", 418, 422, 51.64, 214.2, 18.4, 1998, 12),
  seed(49008, "ISS DEB (FRAG)", "debris", "LEO", "International", "inactive", 412, 426, 51.66, 215.1, 96.2, 2021, 18),
  seed(20580, "HST (HUBBLE)", "satellite", "LEO", "United States", "active", 535, 540, 28.47, 41.2, 210.5, 1990, 40),
  seed(48274, "TIANHE", "satellite", "LEO", "China", "active", 386, 395, 41.48, 122.5, 300.2, 2021, 70),
  seed(25994, "TERRA", "satellite", "LEO", "United States", "active", 705, 707, 98.2, 12.4, 40.1, 1999),
  seed(27424, "AQUA", "satellite", "LEO", "United States", "active", 702, 705, 98.21, 18.8, 150.6, 2002),
  seed(28376, "AURA", "satellite", "LEO", "United States", "active", 708, 712, 98.22, 24.1, 260.4, 2004),
  seed(37849, "SUOMI NPP", "satellite", "LEO", "United States", "active", 824, 827, 98.72, 55.6, 80.2, 2011),
  seed(39084, "LANDSAT 8", "satellite", "LEO", "United States", "active", 701, 704, 98.22, 33.4, 10.8, 2013),
  seed(49260, "LANDSAT 9", "satellite", "LEO", "United States", "active", 702, 705, 98.22, 48.9, 200.3, 2021),
  seed(39634, "SENTINEL-1A", "satellite", "LEO", "ESA", "active", 693, 697, 98.18, 62.2, 125.7, 2014),
  seed(40697, "SENTINEL-2A", "satellite", "LEO", "ESA", "active", 785, 789, 98.57, 71.5, 44.4, 2015),
  seed(42063, "SENTINEL-2B", "satellite", "LEO", "ESA", "active", 786, 789, 98.57, 88.1, 230.9, 2017),
  seed(43013, "NOAA 20", "satellite", "LEO", "United States", "active", 824, 828, 98.75, 101.4, 15.2, 2017),
  seed(28654, "NOAA 18", "satellite", "LEO", "United States", "active", 846, 866, 98.9, 140.2, 310.4, 2005),
  seed(26536, "NOAA 16", "satellite", "LEO", "United States", "decayed", 840, 860, 99.0, 155.6, 20.0, 2000),
  seed(40069, "METEOR-M 2", "satellite", "LEO", "Russia", "active", 816, 828, 98.7, 166.3, 175.5, 2014),
  seed(43010, "FENGYUN 3D", "satellite", "LEO", "China", "active", 830, 836, 98.75, 178.8, 90.1, 2017),
  seed(39766, "ALOS-2", "satellite", "LEO", "Japan", "active", 628, 632, 97.92, 190.4, 250.6, 2014),
  seed(43111, "CARTOSAT-2F", "satellite", "LEO", "India", "active", 505, 508, 97.47, 205.7, 60.3, 2018),
  seed(44857, "RISAT-2BR1", "satellite", "LEO", "India", "active", 555, 562, 37.0, 240.1, 140.8, 2019),
  seed(39419, "DUBAISAT-2", "satellite", "LEO", "UAE", "active", 598, 604, 97.8, 250.5, 330.2, 2013),
  seed(39227, "KOMPSAT-5", "satellite", "LEO", "South Korea", "active", 548, 556, 97.6, 268.4, 75.5, 2013),
  seed(43641, "SAOCOM 1A", "satellite", "LEO", "Argentina", "active", 615, 625, 97.9, 280.2, 195.1, 2018),
  seed(43114, "ICEYE-X2", "satellite", "LEO", "Finland", "active", 568, 576, 97.7, 295.6, 20.7, 2018),
  seed(40115, "WORLDVIEW-3", "satellite", "LEO", "United States", "active", 611, 621, 97.97, 310.3, 265.4, 2014),
  seed(35946, "WORLDVIEW-2", "satellite", "LEO", "United States", "active", 764, 772, 98.4, 322.8, 110.9, 2009),
  seed(39418, "SKYSAT-1", "satellite", "LEO", "United States", "active", 490, 510, 97.3, 8.6, 340.2, 2013),
  seed(41967, "FLOCK 3P-1", "satellite", "LEO", "United States", "active", 500, 512, 97.4, 16.2, 55.5, 2017),
  seed(27386, "ENVISAT", "satellite", "LEO", "ESA", "inactive", 764, 767, 98.4, 44.7, 188.3, 2002),
  seed(42803, "IRIDIUM 106", "satellite", "LEO", "United States", "active", 776, 784, 86.4, 10.5, 22.4, 2017, 20),
  seed(42955, "IRIDIUM 123", "satellite", "LEO", "United States", "active", 776, 783, 86.41, 12.1, 148.6, 2017, 24),
  seed(44713, "STARLINK-1007", "satellite", "LEO", "United States", "active", 547, 553, 53.05, 32.0, 40.2, 2019, 15),
  seed(47366, "STARLINK-2063", "satellite", "LEO", "United States", "active", 538, 546, 53.0, 32.4, 210.8, 2021, 16),
  seed(48215, "STARLINK-3045", "satellite", "LEO", "United States", "active", 548, 556, 53.2, 96.5, 80.4, 2021, 30),
  seed(53421, "STARLINK-4471", "satellite", "LEO", "United States", "active", 528, 540, 43.0, 150.2, 300.1, 2022, 45),
  seed(49044, "ONEWEB-0212", "satellite", "LEO", "United Kingdom", "active", 1195, 1208, 87.4, 64.8, 12.6, 2021),
  seed(47447, "CAPELLA-6", "satellite", "LEO", "United States", "active", 515, 528, 97.5, 118.4, 222.7, 2021),
  seed(43873, "NAVSTAR 77 (GPS III)", "satellite", "MEO", "United States", "active", 20180, 20220, 55.0, 20.0, 30.5, 2018, 10),
  seed(44506, "NAVSTAR 78 (GPS III)", "satellite", "MEO", "United States", "active", 20170, 20210, 55.05, 20.6, 190.2, 2019, 12),
  seed(45854, "NAVSTAR 79 (GPS III)", "satellite", "MEO", "United States", "active", 20180, 20215, 55.1, 140.4, 250.6, 2020, 18),
  seed(40315, "COSMOS 2501 (GLONASS)", "satellite", "MEO", "Russia", "active", 19100, 19140, 64.8, 48.2, 70.4, 2014, 22),
  seed(43508, "COSMOS 2547 (GLONASS)", "satellite", "MEO", "Russia", "active", 19110, 19150, 64.82, 168.5, 300.8, 2018, 28),
  seed(37846, "GSAT0101 (GALILEO)", "satellite", "MEO", "ESA", "active", 23220, 23240, 56.0, 77.3, 15.9, 2011, 35),
  seed(41550, "GSAT0215 (GALILEO)", "satellite", "MEO", "ESA", "active", 23215, 23235, 56.05, 197.6, 160.2, 2016, 40),
  seed(43001, "BEIDOU-3 M5", "satellite", "MEO", "China", "active", 21500, 21540, 55.0, 112.4, 85.5, 2017, 16),
  seed(43622, "BEIDOU-3 M17", "satellite", "MEO", "China", "active", 21510, 21535, 55.02, 232.8, 240.1, 2018, 19),
  seed(41866, "GOES-16", "satellite", "GEO", "United States", "active", 35780, 35792, 0.06, 0, 48.2, 2016, 0),
  seed(51850, "GOES-18", "satellite", "GEO", "United States", "active", 35778, 35790, 0.04, 2, 168.5, 2022, 0),
  seed(40863, "METEOSAT-11", "satellite", "GEO", "EUMETSAT", "active", 35780, 35790, 0.3, 5, 252.4, 2015, 80),
  seed(41836, "HIMAWARI-9", "satellite", "GEO", "Japan", "active", 35782, 35791, 0.1, 8, 310.6, 2016, 70),
  seed(41882, "FENGYUN 4A", "satellite", "GEO", "China", "active", 35776, 35794, 0.2, 12, 95.3, 2016, 60),
  seed(41105, "ELEKTRO-L 2", "satellite", "GEO", "Russia", "active", 35770, 35798, 0.45, 18, 20.7, 2015, 50),
  seed(41752, "INSAT-3DR", "satellite", "GEO", "India", "active", 35780, 35790, 0.12, 22, 200.4, 2016, 40),
  seed(42915, "TDRS-13", "satellite", "GEO", "United States", "active", 35740, 35820, 7.0, 30, 140.8, 2017, 110),
  seed(39285, "ASTRA 2E", "satellite", "GEO", "Luxembourg", "active", 35784, 35790, 0.08, 40, 28.2, 2013, 5),
  seed(40332, "EUTELSAT 3B", "satellite", "GEO", "France", "active", 35780, 35792, 0.1, 46, 3.4, 2014, 8),
  seed(25989, "XMM-NEWTON", "satellite", "HEO", "ESA", "active", 7000, 114000, 67.4, 88.2, 42.6, 1999, 280),
  seed(43186, "MERIDIAN 7", "satellite", "HEO", "Russia", "active", 900, 39700, 62.8, 210.4, 175.3, 2018, 270),
  seed(33918, "COSMOS 2251 DEB", "debris", "LEO", "Russia", "inactive", 770, 820, 74.04, 130.2, 55.4, 1993, 40),
  seed(33942, "COSMOS 2251 DEB (B)", "debris", "LEO", "Russia", "inactive", 740, 860, 74.02, 136.8, 240.1, 1993, 55),
  seed(33773, "IRIDIUM 33 DEB", "debris", "LEO", "United States", "inactive", 760, 805, 86.39, 48.5, 100.6, 1997, 30),
  seed(33852, "IRIDIUM 33 DEB (B)", "debris", "LEO", "United States", "inactive", 730, 830, 86.4, 52.4, 310.2, 1997, 36),
  seed(30690, "FENGYUN 1C DEB", "debris", "LEO", "China", "inactive", 845, 885, 98.65, 92.1, 15.8, 1999, 70),
  seed(31115, "FENGYUN 1C DEB (B)", "debris", "LEO", "China", "inactive", 800, 930, 98.6, 98.6, 200.4, 1999, 80),
  seed(36413, "SL-16 DEB", "debris", "LEO", "Russia", "inactive", 825, 870, 71.0, 175.3, 66.7, 1992, 25),
  seed(22077, "DELTA 2 R/B", "debris", "LEO", "United States", "inactive", 780, 825, 98.1, 60.4, 140.2, 1992, 15),
  seed(54216, "CZ-6A DEB", "debris", "LEO", "China", "inactive", 820, 1040, 98.8, 210.6, 280.5, 2024, 100),
  seed(27941, "H-2A R/B", "debris", "LEO", "Japan", "inactive", 560, 610, 98.2, 300.2, 45.6, 2003, 20),
  seed(43600, "FALCON 9 DEB", "debris", "LEO", "United States", "inactive", 480, 530, 53.05, 96.8, 170.4, 2018, 10),
];

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toObject(raw: RawSeed): SpaceObject {
  const elements = elementsFromAltitudes(raw.perigeeKm, raw.apogeeKm);
  return {
    id: String(raw.noradId),
    noradId: raw.noradId,
    name: raw.name,
    kind: raw.kind,
    regime: raw.regime,
    country: raw.country,
    status: raw.status,
    altitudeKm: round(elements.altitudeKm, 1),
    perigeeKm: raw.perigeeKm,
    apogeeKm: raw.apogeeKm,
    inclinationDeg: raw.inclinationDeg,
    periodMin: round(elements.periodMin, 2),
    raanDeg: raw.raanDeg,
    argPerigeeDeg: raw.argPerigeeDeg,
    meanAnomalyDeg: raw.meanAnomalyDeg,
    eccentricity: round(elements.eccentricity, 6),
    launchYear: raw.launchYear,
  };
}

export const CATALOG: SpaceObject[] = SEEDS.map(toObject);

export const CATALOG_NOTE =
  "Sample catalog of published-class orbits for satellites and debris. Period and eccentricity are derived from altitude. Not a live catalog feed.";
