/**
 * Major World Cities Database
 *
 * Contains ~50 major cities from all continents for the Power Places feature.
 * Cities are used to find locations near planetary lines.
 */

export interface WorldCity {
  name: string;
  country: string;
  countryCode: string;  // ISO 2-letter code for flag emoji
  lat: number;
  lng: number;
  region: "north-america" | "south-america" | "europe" | "asia" | "africa" | "oceania";
}

/**
 * Convert country code to flag emoji
 */
export function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Major world cities database
 * Selected for global coverage and tourism/relocation relevance
 */
export const MAJOR_CITIES: WorldCity[] = [
  // North America
  { name: "New York", country: "USA", countryCode: "US", lat: 40.7128, lng: -74.0060, region: "north-america" },
  { name: "Los Angeles", country: "USA", countryCode: "US", lat: 34.0522, lng: -118.2437, region: "north-america" },
  { name: "Miami", country: "USA", countryCode: "US", lat: 25.7617, lng: -80.1918, region: "north-america" },
  { name: "San Francisco", country: "USA", countryCode: "US", lat: 37.7749, lng: -122.4194, region: "north-america" },
  { name: "Chicago", country: "USA", countryCode: "US", lat: 41.8781, lng: -87.6298, region: "north-america" },
  { name: "Austin", country: "USA", countryCode: "US", lat: 30.2672, lng: -97.7431, region: "north-america" },
  { name: "Toronto", country: "Canada", countryCode: "CA", lat: 43.6532, lng: -79.3832, region: "north-america" },
  { name: "Vancouver", country: "Canada", countryCode: "CA", lat: 49.2827, lng: -123.1207, region: "north-america" },
  { name: "Mexico City", country: "Mexico", countryCode: "MX", lat: 19.4326, lng: -99.1332, region: "north-america" },

  // South America
  { name: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.6037, lng: -58.3816, region: "south-america" },
  { name: "Sao Paulo", country: "Brazil", countryCode: "BR", lat: -23.5505, lng: -46.6333, region: "south-america" },
  { name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", lat: -22.9068, lng: -43.1729, region: "south-america" },
  { name: "Lima", country: "Peru", countryCode: "PE", lat: -12.0464, lng: -77.0428, region: "south-america" },
  { name: "Bogota", country: "Colombia", countryCode: "CO", lat: 4.7110, lng: -74.0721, region: "south-america" },
  { name: "Santiago", country: "Chile", countryCode: "CL", lat: -33.4489, lng: -70.6693, region: "south-america" },

  // Europe
  { name: "London", country: "UK", countryCode: "GB", lat: 51.5074, lng: -0.1278, region: "europe" },
  { name: "Paris", country: "France", countryCode: "FR", lat: 48.8566, lng: 2.3522, region: "europe" },
  { name: "Berlin", country: "Germany", countryCode: "DE", lat: 52.5200, lng: 13.4050, region: "europe" },
  { name: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3676, lng: 4.9041, region: "europe" },
  { name: "Rome", country: "Italy", countryCode: "IT", lat: 41.9028, lng: 12.4964, region: "europe" },
  { name: "Barcelona", country: "Spain", countryCode: "ES", lat: 41.3851, lng: 2.1734, region: "europe" },
  { name: "Madrid", country: "Spain", countryCode: "ES", lat: 40.4168, lng: -3.7038, region: "europe" },
  { name: "Lisbon", country: "Portugal", countryCode: "PT", lat: 38.7223, lng: -9.1393, region: "europe" },
  { name: "Vienna", country: "Austria", countryCode: "AT", lat: 48.2082, lng: 16.3738, region: "europe" },
  { name: "Prague", country: "Czech Republic", countryCode: "CZ", lat: 50.0755, lng: 14.4378, region: "europe" },
  { name: "Zurich", country: "Switzerland", countryCode: "CH", lat: 47.3769, lng: 8.5417, region: "europe" },
  { name: "Copenhagen", country: "Denmark", countryCode: "DK", lat: 55.6761, lng: 12.5683, region: "europe" },
  { name: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.3293, lng: 18.0686, region: "europe" },
  { name: "Athens", country: "Greece", countryCode: "GR", lat: 37.9838, lng: 23.7275, region: "europe" },
  { name: "Dublin", country: "Ireland", countryCode: "IE", lat: 53.3498, lng: -6.2603, region: "europe" },

  // Asia
  { name: "Tokyo", country: "Japan", countryCode: "JP", lat: 35.6762, lng: 139.6503, region: "asia" },
  { name: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3521, lng: 103.8198, region: "asia" },
  { name: "Hong Kong", country: "Hong Kong", countryCode: "HK", lat: 22.3193, lng: 114.1694, region: "asia" },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.7563, lng: 100.5018, region: "asia" },
  { name: "Dubai", country: "UAE", countryCode: "AE", lat: 25.2048, lng: 55.2708, region: "asia" },
  { name: "Mumbai", country: "India", countryCode: "IN", lat: 19.0760, lng: 72.8777, region: "asia" },
  { name: "Seoul", country: "South Korea", countryCode: "KR", lat: 37.5665, lng: 126.9780, region: "asia" },
  { name: "Taipei", country: "Taiwan", countryCode: "TW", lat: 25.0330, lng: 121.5654, region: "asia" },
  { name: "Bali", country: "Indonesia", countryCode: "ID", lat: -8.3405, lng: 115.0920, region: "asia" },
  { name: "Tel Aviv", country: "Israel", countryCode: "IL", lat: 32.0853, lng: 34.7818, region: "asia" },

  // Africa
  { name: "Cape Town", country: "South Africa", countryCode: "ZA", lat: -33.9249, lng: 18.4241, region: "africa" },
  { name: "Marrakech", country: "Morocco", countryCode: "MA", lat: 31.6295, lng: -7.9811, region: "africa" },
  { name: "Cairo", country: "Egypt", countryCode: "EG", lat: 30.0444, lng: 31.2357, region: "africa" },
  { name: "Nairobi", country: "Kenya", countryCode: "KE", lat: -1.2921, lng: 36.8219, region: "africa" },

  // Oceania
  { name: "Sydney", country: "Australia", countryCode: "AU", lat: -33.8688, lng: 151.2093, region: "oceania" },
  { name: "Melbourne", country: "Australia", countryCode: "AU", lat: -37.8136, lng: 144.9631, region: "oceania" },
  { name: "Auckland", country: "New Zealand", countryCode: "NZ", lat: -36.8509, lng: 174.7645, region: "oceania" },
  { name: "Bali", country: "Indonesia", countryCode: "ID", lat: -8.3405, lng: 115.0920, region: "oceania" },
];

/**
 * Get cities by region
 */
export function getCitiesByRegion(region: WorldCity["region"]): WorldCity[] {
  return MAJOR_CITIES.filter((city) => city.region === region);
}

/**
 * Search cities by name (case insensitive)
 */
export function searchCities(query: string): WorldCity[] {
  const lowerQuery = query.toLowerCase();
  return MAJOR_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.country.toLowerCase().includes(lowerQuery)
  );
}
