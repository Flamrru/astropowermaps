/**
 * Type declarations for the astronomia library
 * https://github.com/commenthol/astronomia
 */

declare module "astronomia/julian" {
  export function CalendarGregorianToJD(year: number, month: number, day: number): number;
  export function JDToCalendarGregorian(jd: number): { year: number; month: number; day: number };
}

declare module "astronomia/sidereal" {
  export function mean(jd: number): number;
  export function apparent(jd: number): number;
}

declare module "astronomia/moonposition" {
  export interface MoonPosition {
    lon: number;  // Geocentric longitude in radians
    lat: number;  // Geocentric latitude in radians
    range: number; // Distance in km
  }
  export function position(jde: number): MoonPosition;
}

declare module "astronomia/nutation" {
  export function meanObliquity(jde: number): number;
  export function nutation(jde: number): [number, number];
}

declare module "astronomia/solar" {
  export function trueLongitude(T: number): { lon: number; ano: number };
  export function meanAnomaly(T: number): number;
  export function eccentricity(T: number): number;
  export function radius(T: number): number;
}

declare module "astronomia/planetposition" {
  export interface PlanetData {
    name: string;
    type?: string;
    L: number[][];
    B: number[][];
    R: number[][];
  }

  export interface Coord {
    lon: number;  // Heliocentric longitude in radians
    lat: number;  // Heliocentric latitude in radians
    range: number; // Distance in AU
  }

  export class Planet {
    constructor(planet: PlanetData);
    name: string;
    position2000(jde: number): Coord;
    position(jde: number): Coord;
  }
}

declare module "astronomia/coord" {
  export class Ecliptic {
    lon: number;
    lat: number;
    constructor(lon?: number, lat?: number);
    toEquatorial(obliquity: number): Equatorial;
  }

  export class Equatorial {
    ra: number;   // Right ascension in radians
    dec: number;  // Declination in radians
    constructor(ra?: number, dec?: number);
    toEcliptic(obliquity: number): Ecliptic;
  }
}

declare module "astronomia/data/vsop87Bmercury" {
  import { PlanetData } from "astronomia/planetposition";
  const data: PlanetData;
  export default data;
}

declare module "astronomia/data/vsop87Bvenus" {
  import { PlanetData } from "astronomia/planetposition";
  const data: PlanetData;
  export default data;
}

declare module "astronomia/data/vsop87Bearth" {
  import { PlanetData } from "astronomia/planetposition";
  const data: PlanetData;
  export default data;
}

declare module "astronomia/data/vsop87Bmars" {
  import { PlanetData } from "astronomia/planetposition";
  const data: PlanetData;
  export default data;
}

declare module "astronomia/data/vsop87Bjupiter" {
  import { PlanetData } from "astronomia/planetposition";
  const data: PlanetData;
  export default data;
}

declare module "astronomia/data/vsop87Bsaturn" {
  import { PlanetData } from "astronomia/planetposition";
  const data: PlanetData;
  export default data;
}

declare module "astronomia/data/vsop87Buranus" {
  import { PlanetData } from "astronomia/planetposition";
  const data: PlanetData;
  export default data;
}

declare module "astronomia/data/vsop87Bneptune" {
  import { PlanetData } from "astronomia/planetposition";
  const data: PlanetData;
  export default data;
}
