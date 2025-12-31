/**
 * Major World Cities Database
 *
 * Contains 350 major cities from all continents for the Power Places feature.
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
 * Major world cities database (350 cities)
 * Selected for global coverage and tourism/relocation relevance
 */
export const MAJOR_CITIES: WorldCity[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // NORTH AMERICA (~60 cities)
  // ═══════════════════════════════════════════════════════════════════════════

  // United States - Major metros
  { name: "New York", country: "USA", countryCode: "US", lat: 40.7128, lng: -74.0060, region: "north-america" },
  { name: "Los Angeles", country: "USA", countryCode: "US", lat: 34.0522, lng: -118.2437, region: "north-america" },
  { name: "Chicago", country: "USA", countryCode: "US", lat: 41.8781, lng: -87.6298, region: "north-america" },
  { name: "Houston", country: "USA", countryCode: "US", lat: 29.7604, lng: -95.3698, region: "north-america" },
  { name: "Phoenix", country: "USA", countryCode: "US", lat: 33.4484, lng: -112.0740, region: "north-america" },
  { name: "Philadelphia", country: "USA", countryCode: "US", lat: 39.9526, lng: -75.1652, region: "north-america" },
  { name: "San Antonio", country: "USA", countryCode: "US", lat: 29.4241, lng: -98.4936, region: "north-america" },
  { name: "San Diego", country: "USA", countryCode: "US", lat: 32.7157, lng: -117.1611, region: "north-america" },
  { name: "Dallas", country: "USA", countryCode: "US", lat: 32.7767, lng: -96.7970, region: "north-america" },
  { name: "San Francisco", country: "USA", countryCode: "US", lat: 37.7749, lng: -122.4194, region: "north-america" },
  { name: "Austin", country: "USA", countryCode: "US", lat: 30.2672, lng: -97.7431, region: "north-america" },
  { name: "Seattle", country: "USA", countryCode: "US", lat: 47.6062, lng: -122.3321, region: "north-america" },
  { name: "Denver", country: "USA", countryCode: "US", lat: 39.7392, lng: -104.9903, region: "north-america" },
  { name: "Boston", country: "USA", countryCode: "US", lat: 42.3601, lng: -71.0589, region: "north-america" },
  { name: "Miami", country: "USA", countryCode: "US", lat: 25.7617, lng: -80.1918, region: "north-america" },
  { name: "Atlanta", country: "USA", countryCode: "US", lat: 33.7490, lng: -84.3880, region: "north-america" },
  { name: "Nashville", country: "USA", countryCode: "US", lat: 36.1627, lng: -86.7816, region: "north-america" },
  { name: "Portland", country: "USA", countryCode: "US", lat: 45.5152, lng: -122.6784, region: "north-america" },
  { name: "Las Vegas", country: "USA", countryCode: "US", lat: 36.1699, lng: -115.1398, region: "north-america" },
  { name: "Detroit", country: "USA", countryCode: "US", lat: 42.3314, lng: -83.0458, region: "north-america" },
  { name: "Minneapolis", country: "USA", countryCode: "US", lat: 44.9778, lng: -93.2650, region: "north-america" },
  { name: "San Jose", country: "USA", countryCode: "US", lat: 37.3382, lng: -121.8863, region: "north-america" },
  { name: "Tampa", country: "USA", countryCode: "US", lat: 27.9506, lng: -82.4572, region: "north-america" },
  { name: "Orlando", country: "USA", countryCode: "US", lat: 28.5383, lng: -81.3792, region: "north-america" },
  { name: "Charlotte", country: "USA", countryCode: "US", lat: 35.2271, lng: -80.8431, region: "north-america" },
  { name: "Raleigh", country: "USA", countryCode: "US", lat: 35.7796, lng: -78.6382, region: "north-america" },
  { name: "Salt Lake City", country: "USA", countryCode: "US", lat: 40.7608, lng: -111.8910, region: "north-america" },
  { name: "Pittsburgh", country: "USA", countryCode: "US", lat: 40.4406, lng: -79.9959, region: "north-america" },
  { name: "New Orleans", country: "USA", countryCode: "US", lat: 29.9511, lng: -90.0715, region: "north-america" },
  { name: "Honolulu", country: "USA", countryCode: "US", lat: 21.3069, lng: -157.8583, region: "north-america" },
  { name: "Anchorage", country: "USA", countryCode: "US", lat: 61.2181, lng: -149.9003, region: "north-america" },
  { name: "Cincinnati", country: "USA", countryCode: "US", lat: 39.1031, lng: -84.5120, region: "north-america" },
  { name: "Cleveland", country: "USA", countryCode: "US", lat: 41.4993, lng: -81.6944, region: "north-america" },
  { name: "Kansas City", country: "USA", countryCode: "US", lat: 39.0997, lng: -94.5786, region: "north-america" },
  { name: "St. Louis", country: "USA", countryCode: "US", lat: 38.6270, lng: -90.1994, region: "north-america" },
  { name: "Indianapolis", country: "USA", countryCode: "US", lat: 39.7684, lng: -86.1581, region: "north-america" },
  { name: "Columbus", country: "USA", countryCode: "US", lat: 39.9612, lng: -82.9988, region: "north-america" },
  { name: "Baltimore", country: "USA", countryCode: "US", lat: 39.2904, lng: -76.6122, region: "north-america" },
  { name: "Milwaukee", country: "USA", countryCode: "US", lat: 43.0389, lng: -87.9065, region: "north-america" },
  { name: "Sacramento", country: "USA", countryCode: "US", lat: 38.5816, lng: -121.4944, region: "north-america" },

  // Canada
  { name: "Toronto", country: "Canada", countryCode: "CA", lat: 43.6532, lng: -79.3832, region: "north-america" },
  { name: "Vancouver", country: "Canada", countryCode: "CA", lat: 49.2827, lng: -123.1207, region: "north-america" },
  { name: "Montreal", country: "Canada", countryCode: "CA", lat: 45.5017, lng: -73.5673, region: "north-america" },
  { name: "Calgary", country: "Canada", countryCode: "CA", lat: 51.0447, lng: -114.0719, region: "north-america" },
  { name: "Ottawa", country: "Canada", countryCode: "CA", lat: 45.4215, lng: -75.6972, region: "north-america" },
  { name: "Edmonton", country: "Canada", countryCode: "CA", lat: 53.5461, lng: -113.4938, region: "north-america" },
  { name: "Quebec City", country: "Canada", countryCode: "CA", lat: 46.8139, lng: -71.2080, region: "north-america" },
  { name: "Winnipeg", country: "Canada", countryCode: "CA", lat: 49.8951, lng: -97.1384, region: "north-america" },
  { name: "Halifax", country: "Canada", countryCode: "CA", lat: 44.6488, lng: -63.5752, region: "north-america" },
  { name: "Victoria", country: "Canada", countryCode: "CA", lat: 48.4284, lng: -123.3656, region: "north-america" },

  // Mexico
  { name: "Mexico City", country: "Mexico", countryCode: "MX", lat: 19.4326, lng: -99.1332, region: "north-america" },
  { name: "Guadalajara", country: "Mexico", countryCode: "MX", lat: 20.6597, lng: -103.3496, region: "north-america" },
  { name: "Monterrey", country: "Mexico", countryCode: "MX", lat: 25.6866, lng: -100.3161, region: "north-america" },
  { name: "Cancun", country: "Mexico", countryCode: "MX", lat: 21.1619, lng: -86.8515, region: "north-america" },
  { name: "Tijuana", country: "Mexico", countryCode: "MX", lat: 32.5149, lng: -117.0382, region: "north-america" },
  { name: "Puebla", country: "Mexico", countryCode: "MX", lat: 19.0414, lng: -98.2063, region: "north-america" },
  { name: "Puerto Vallarta", country: "Mexico", countryCode: "MX", lat: 20.6534, lng: -105.2253, region: "north-america" },
  { name: "Merida", country: "Mexico", countryCode: "MX", lat: 20.9674, lng: -89.5926, region: "north-america" },

  // Caribbean & Central America
  { name: "Havana", country: "Cuba", countryCode: "CU", lat: 23.1136, lng: -82.3666, region: "north-america" },
  { name: "San Juan", country: "Puerto Rico", countryCode: "PR", lat: 18.4655, lng: -66.1057, region: "north-america" },
  { name: "Santo Domingo", country: "Dominican Republic", countryCode: "DO", lat: 18.4861, lng: -69.9312, region: "north-america" },
  { name: "Kingston", country: "Jamaica", countryCode: "JM", lat: 18.0179, lng: -76.8099, region: "north-america" },
  { name: "Nassau", country: "Bahamas", countryCode: "BS", lat: 25.0343, lng: -77.3963, region: "north-america" },
  { name: "Panama City", country: "Panama", countryCode: "PA", lat: 8.9824, lng: -79.5199, region: "north-america" },
  { name: "San Jose", country: "Costa Rica", countryCode: "CR", lat: 9.9281, lng: -84.0907, region: "north-america" },
  { name: "Guatemala City", country: "Guatemala", countryCode: "GT", lat: 14.6349, lng: -90.5069, region: "north-america" },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUTH AMERICA (~40 cities)
  // ═══════════════════════════════════════════════════════════════════════════

  // Brazil
  { name: "Sao Paulo", country: "Brazil", countryCode: "BR", lat: -23.5505, lng: -46.6333, region: "south-america" },
  { name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", lat: -22.9068, lng: -43.1729, region: "south-america" },
  { name: "Brasilia", country: "Brazil", countryCode: "BR", lat: -15.7975, lng: -47.8919, region: "south-america" },
  { name: "Salvador", country: "Brazil", countryCode: "BR", lat: -12.9714, lng: -38.5014, region: "south-america" },
  { name: "Fortaleza", country: "Brazil", countryCode: "BR", lat: -3.7172, lng: -38.5433, region: "south-america" },
  { name: "Belo Horizonte", country: "Brazil", countryCode: "BR", lat: -19.9167, lng: -43.9345, region: "south-america" },
  { name: "Curitiba", country: "Brazil", countryCode: "BR", lat: -25.4290, lng: -49.2671, region: "south-america" },
  { name: "Recife", country: "Brazil", countryCode: "BR", lat: -8.0476, lng: -34.8770, region: "south-america" },
  { name: "Porto Alegre", country: "Brazil", countryCode: "BR", lat: -30.0346, lng: -51.2177, region: "south-america" },
  { name: "Manaus", country: "Brazil", countryCode: "BR", lat: -3.1190, lng: -60.0217, region: "south-america" },
  { name: "Florianopolis", country: "Brazil", countryCode: "BR", lat: -27.5954, lng: -48.5480, region: "south-america" },

  // Argentina
  { name: "Buenos Aires", country: "Argentina", countryCode: "AR", lat: -34.6037, lng: -58.3816, region: "south-america" },
  { name: "Cordoba", country: "Argentina", countryCode: "AR", lat: -31.4201, lng: -64.1888, region: "south-america" },
  { name: "Mendoza", country: "Argentina", countryCode: "AR", lat: -32.8895, lng: -68.8458, region: "south-america" },
  { name: "Rosario", country: "Argentina", countryCode: "AR", lat: -32.9587, lng: -60.6930, region: "south-america" },
  { name: "Bariloche", country: "Argentina", countryCode: "AR", lat: -41.1335, lng: -71.3103, region: "south-america" },

  // Colombia
  { name: "Bogota", country: "Colombia", countryCode: "CO", lat: 4.7110, lng: -74.0721, region: "south-america" },
  { name: "Medellin", country: "Colombia", countryCode: "CO", lat: 6.2442, lng: -75.5812, region: "south-america" },
  { name: "Cartagena", country: "Colombia", countryCode: "CO", lat: 10.3910, lng: -75.4794, region: "south-america" },
  { name: "Cali", country: "Colombia", countryCode: "CO", lat: 3.4516, lng: -76.5320, region: "south-america" },
  { name: "Barranquilla", country: "Colombia", countryCode: "CO", lat: 10.9685, lng: -74.7813, region: "south-america" },

  // Chile
  { name: "Santiago", country: "Chile", countryCode: "CL", lat: -33.4489, lng: -70.6693, region: "south-america" },
  { name: "Valparaiso", country: "Chile", countryCode: "CL", lat: -33.0472, lng: -71.6127, region: "south-america" },
  { name: "Concepcion", country: "Chile", countryCode: "CL", lat: -36.8270, lng: -73.0503, region: "south-america" },

  // Peru
  { name: "Lima", country: "Peru", countryCode: "PE", lat: -12.0464, lng: -77.0428, region: "south-america" },
  { name: "Cusco", country: "Peru", countryCode: "PE", lat: -13.5319, lng: -71.9675, region: "south-america" },
  { name: "Arequipa", country: "Peru", countryCode: "PE", lat: -16.4090, lng: -71.5375, region: "south-america" },

  // Other South American countries
  { name: "Quito", country: "Ecuador", countryCode: "EC", lat: -0.1807, lng: -78.4678, region: "south-america" },
  { name: "Guayaquil", country: "Ecuador", countryCode: "EC", lat: -2.1710, lng: -79.9224, region: "south-america" },
  { name: "Caracas", country: "Venezuela", countryCode: "VE", lat: 10.4806, lng: -66.9036, region: "south-america" },
  { name: "Montevideo", country: "Uruguay", countryCode: "UY", lat: -34.9011, lng: -56.1645, region: "south-america" },
  { name: "Punta del Este", country: "Uruguay", countryCode: "UY", lat: -34.9667, lng: -54.9500, region: "south-america" },
  { name: "Asuncion", country: "Paraguay", countryCode: "PY", lat: -25.2637, lng: -57.5759, region: "south-america" },
  { name: "La Paz", country: "Bolivia", countryCode: "BO", lat: -16.4897, lng: -68.1193, region: "south-america" },
  { name: "Santa Cruz", country: "Bolivia", countryCode: "BO", lat: -17.7833, lng: -63.1822, region: "south-america" },

  // ═══════════════════════════════════════════════════════════════════════════
  // EUROPE (~100 cities)
  // ═══════════════════════════════════════════════════════════════════════════

  // United Kingdom
  { name: "London", country: "UK", countryCode: "GB", lat: 51.5074, lng: -0.1278, region: "europe" },
  { name: "Manchester", country: "UK", countryCode: "GB", lat: 53.4808, lng: -2.2426, region: "europe" },
  { name: "Birmingham", country: "UK", countryCode: "GB", lat: 52.4862, lng: -1.8904, region: "europe" },
  { name: "Edinburgh", country: "UK", countryCode: "GB", lat: 55.9533, lng: -3.1883, region: "europe" },
  { name: "Glasgow", country: "UK", countryCode: "GB", lat: 55.8642, lng: -4.2518, region: "europe" },
  { name: "Liverpool", country: "UK", countryCode: "GB", lat: 53.4084, lng: -2.9916, region: "europe" },
  { name: "Bristol", country: "UK", countryCode: "GB", lat: 51.4545, lng: -2.5879, region: "europe" },
  { name: "Leeds", country: "UK", countryCode: "GB", lat: 53.8008, lng: -1.5491, region: "europe" },
  { name: "Cambridge", country: "UK", countryCode: "GB", lat: 52.2053, lng: 0.1218, region: "europe" },
  { name: "Oxford", country: "UK", countryCode: "GB", lat: 51.7520, lng: -1.2577, region: "europe" },

  // France
  { name: "Paris", country: "France", countryCode: "FR", lat: 48.8566, lng: 2.3522, region: "europe" },
  { name: "Lyon", country: "France", countryCode: "FR", lat: 45.7640, lng: 4.8357, region: "europe" },
  { name: "Marseille", country: "France", countryCode: "FR", lat: 43.2965, lng: 5.3698, region: "europe" },
  { name: "Nice", country: "France", countryCode: "FR", lat: 43.7102, lng: 7.2620, region: "europe" },
  { name: "Bordeaux", country: "France", countryCode: "FR", lat: 44.8378, lng: -0.5792, region: "europe" },
  { name: "Toulouse", country: "France", countryCode: "FR", lat: 43.6047, lng: 1.4442, region: "europe" },
  { name: "Strasbourg", country: "France", countryCode: "FR", lat: 48.5734, lng: 7.7521, region: "europe" },
  { name: "Montpellier", country: "France", countryCode: "FR", lat: 43.6108, lng: 3.8767, region: "europe" },

  // Germany
  { name: "Berlin", country: "Germany", countryCode: "DE", lat: 52.5200, lng: 13.4050, region: "europe" },
  { name: "Munich", country: "Germany", countryCode: "DE", lat: 48.1351, lng: 11.5820, region: "europe" },
  { name: "Hamburg", country: "Germany", countryCode: "DE", lat: 53.5511, lng: 9.9937, region: "europe" },
  { name: "Frankfurt", country: "Germany", countryCode: "DE", lat: 50.1109, lng: 8.6821, region: "europe" },
  { name: "Cologne", country: "Germany", countryCode: "DE", lat: 50.9375, lng: 6.9603, region: "europe" },
  { name: "Dusseldorf", country: "Germany", countryCode: "DE", lat: 51.2277, lng: 6.7735, region: "europe" },
  { name: "Stuttgart", country: "Germany", countryCode: "DE", lat: 48.7758, lng: 9.1829, region: "europe" },
  { name: "Dresden", country: "Germany", countryCode: "DE", lat: 51.0504, lng: 13.7373, region: "europe" },
  { name: "Leipzig", country: "Germany", countryCode: "DE", lat: 51.3397, lng: 12.3731, region: "europe" },

  // Italy
  { name: "Rome", country: "Italy", countryCode: "IT", lat: 41.9028, lng: 12.4964, region: "europe" },
  { name: "Milan", country: "Italy", countryCode: "IT", lat: 45.4642, lng: 9.1900, region: "europe" },
  { name: "Florence", country: "Italy", countryCode: "IT", lat: 43.7696, lng: 11.2558, region: "europe" },
  { name: "Venice", country: "Italy", countryCode: "IT", lat: 45.4408, lng: 12.3155, region: "europe" },
  { name: "Naples", country: "Italy", countryCode: "IT", lat: 40.8518, lng: 14.2681, region: "europe" },
  { name: "Turin", country: "Italy", countryCode: "IT", lat: 45.0703, lng: 7.6869, region: "europe" },
  { name: "Bologna", country: "Italy", countryCode: "IT", lat: 44.4949, lng: 11.3426, region: "europe" },
  { name: "Palermo", country: "Italy", countryCode: "IT", lat: 38.1157, lng: 13.3615, region: "europe" },

  // Spain
  { name: "Madrid", country: "Spain", countryCode: "ES", lat: 40.4168, lng: -3.7038, region: "europe" },
  { name: "Barcelona", country: "Spain", countryCode: "ES", lat: 41.3851, lng: 2.1734, region: "europe" },
  { name: "Valencia", country: "Spain", countryCode: "ES", lat: 39.4699, lng: -0.3763, region: "europe" },
  { name: "Seville", country: "Spain", countryCode: "ES", lat: 37.3891, lng: -5.9845, region: "europe" },
  { name: "Bilbao", country: "Spain", countryCode: "ES", lat: 43.2630, lng: -2.9350, region: "europe" },
  { name: "Malaga", country: "Spain", countryCode: "ES", lat: 36.7213, lng: -4.4214, region: "europe" },
  { name: "Granada", country: "Spain", countryCode: "ES", lat: 37.1773, lng: -3.5986, region: "europe" },
  { name: "Palma de Mallorca", country: "Spain", countryCode: "ES", lat: 39.5696, lng: 2.6502, region: "europe" },
  { name: "Ibiza", country: "Spain", countryCode: "ES", lat: 38.9067, lng: 1.4206, region: "europe" },

  // Portugal
  { name: "Lisbon", country: "Portugal", countryCode: "PT", lat: 38.7223, lng: -9.1393, region: "europe" },
  { name: "Porto", country: "Portugal", countryCode: "PT", lat: 41.1579, lng: -8.6291, region: "europe" },
  { name: "Faro", country: "Portugal", countryCode: "PT", lat: 37.0194, lng: -7.9322, region: "europe" },

  // Netherlands
  { name: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3676, lng: 4.9041, region: "europe" },
  { name: "Rotterdam", country: "Netherlands", countryCode: "NL", lat: 51.9244, lng: 4.4777, region: "europe" },
  { name: "The Hague", country: "Netherlands", countryCode: "NL", lat: 52.0705, lng: 4.3007, region: "europe" },
  { name: "Utrecht", country: "Netherlands", countryCode: "NL", lat: 52.0907, lng: 5.1214, region: "europe" },

  // Belgium
  { name: "Brussels", country: "Belgium", countryCode: "BE", lat: 50.8503, lng: 4.3517, region: "europe" },
  { name: "Antwerp", country: "Belgium", countryCode: "BE", lat: 51.2194, lng: 4.4025, region: "europe" },
  { name: "Bruges", country: "Belgium", countryCode: "BE", lat: 51.2093, lng: 3.2247, region: "europe" },

  // Switzerland
  { name: "Zurich", country: "Switzerland", countryCode: "CH", lat: 47.3769, lng: 8.5417, region: "europe" },
  { name: "Geneva", country: "Switzerland", countryCode: "CH", lat: 46.2044, lng: 6.1432, region: "europe" },
  { name: "Basel", country: "Switzerland", countryCode: "CH", lat: 47.5596, lng: 7.5886, region: "europe" },
  { name: "Bern", country: "Switzerland", countryCode: "CH", lat: 46.9480, lng: 7.4474, region: "europe" },

  // Austria
  { name: "Vienna", country: "Austria", countryCode: "AT", lat: 48.2082, lng: 16.3738, region: "europe" },
  { name: "Salzburg", country: "Austria", countryCode: "AT", lat: 47.8095, lng: 13.0550, region: "europe" },
  { name: "Innsbruck", country: "Austria", countryCode: "AT", lat: 47.2692, lng: 11.4041, region: "europe" },

  // Scandinavia
  { name: "Copenhagen", country: "Denmark", countryCode: "DK", lat: 55.6761, lng: 12.5683, region: "europe" },
  { name: "Stockholm", country: "Sweden", countryCode: "SE", lat: 59.3293, lng: 18.0686, region: "europe" },
  { name: "Gothenburg", country: "Sweden", countryCode: "SE", lat: 57.7089, lng: 11.9746, region: "europe" },
  { name: "Malmo", country: "Sweden", countryCode: "SE", lat: 55.6050, lng: 13.0038, region: "europe" },
  { name: "Oslo", country: "Norway", countryCode: "NO", lat: 59.9139, lng: 10.7522, region: "europe" },
  { name: "Bergen", country: "Norway", countryCode: "NO", lat: 60.3913, lng: 5.3221, region: "europe" },
  { name: "Helsinki", country: "Finland", countryCode: "FI", lat: 60.1699, lng: 24.9384, region: "europe" },
  { name: "Reykjavik", country: "Iceland", countryCode: "IS", lat: 64.1466, lng: -21.9426, region: "europe" },

  // Eastern Europe
  { name: "Prague", country: "Czech Republic", countryCode: "CZ", lat: 50.0755, lng: 14.4378, region: "europe" },
  { name: "Warsaw", country: "Poland", countryCode: "PL", lat: 52.2297, lng: 21.0122, region: "europe" },
  { name: "Krakow", country: "Poland", countryCode: "PL", lat: 50.0647, lng: 19.9450, region: "europe" },
  { name: "Gdansk", country: "Poland", countryCode: "PL", lat: 54.3520, lng: 18.6466, region: "europe" },
  { name: "Budapest", country: "Hungary", countryCode: "HU", lat: 47.4979, lng: 19.0402, region: "europe" },
  { name: "Bucharest", country: "Romania", countryCode: "RO", lat: 44.4268, lng: 26.1025, region: "europe" },
  { name: "Sofia", country: "Bulgaria", countryCode: "BG", lat: 42.6977, lng: 23.3219, region: "europe" },
  { name: "Belgrade", country: "Serbia", countryCode: "RS", lat: 44.7866, lng: 20.4489, region: "europe" },
  { name: "Zagreb", country: "Croatia", countryCode: "HR", lat: 45.8150, lng: 15.9819, region: "europe" },
  { name: "Dubrovnik", country: "Croatia", countryCode: "HR", lat: 42.6507, lng: 18.0944, region: "europe" },
  { name: "Split", country: "Croatia", countryCode: "HR", lat: 43.5081, lng: 16.4402, region: "europe" },
  { name: "Ljubljana", country: "Slovenia", countryCode: "SI", lat: 46.0569, lng: 14.5058, region: "europe" },
  { name: "Bratislava", country: "Slovakia", countryCode: "SK", lat: 48.1486, lng: 17.1077, region: "europe" },
  { name: "Tallinn", country: "Estonia", countryCode: "EE", lat: 59.4370, lng: 24.7536, region: "europe" },
  { name: "Riga", country: "Latvia", countryCode: "LV", lat: 56.9496, lng: 24.1052, region: "europe" },
  { name: "Vilnius", country: "Lithuania", countryCode: "LT", lat: 54.6872, lng: 25.2797, region: "europe" },
  { name: "Kyiv", country: "Ukraine", countryCode: "UA", lat: 50.4501, lng: 30.5234, region: "europe" },

  // Greece & Cyprus
  { name: "Athens", country: "Greece", countryCode: "GR", lat: 37.9838, lng: 23.7275, region: "europe" },
  { name: "Thessaloniki", country: "Greece", countryCode: "GR", lat: 40.6401, lng: 22.9444, region: "europe" },
  { name: "Santorini", country: "Greece", countryCode: "GR", lat: 36.3932, lng: 25.4615, region: "europe" },
  { name: "Mykonos", country: "Greece", countryCode: "GR", lat: 37.4467, lng: 25.3289, region: "europe" },
  { name: "Nicosia", country: "Cyprus", countryCode: "CY", lat: 35.1856, lng: 33.3823, region: "europe" },

  // Ireland
  { name: "Dublin", country: "Ireland", countryCode: "IE", lat: 53.3498, lng: -6.2603, region: "europe" },
  { name: "Cork", country: "Ireland", countryCode: "IE", lat: 51.8985, lng: -8.4756, region: "europe" },
  { name: "Galway", country: "Ireland", countryCode: "IE", lat: 53.2707, lng: -9.0568, region: "europe" },

  // Other European
  { name: "Monaco", country: "Monaco", countryCode: "MC", lat: 43.7384, lng: 7.4246, region: "europe" },
  { name: "Luxembourg", country: "Luxembourg", countryCode: "LU", lat: 49.6116, lng: 6.1319, region: "europe" },
  { name: "Malta", country: "Malta", countryCode: "MT", lat: 35.8989, lng: 14.5146, region: "europe" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ASIA (~100 cities)
  // ═══════════════════════════════════════════════════════════════════════════

  // Japan
  { name: "Tokyo", country: "Japan", countryCode: "JP", lat: 35.6762, lng: 139.6503, region: "asia" },
  { name: "Osaka", country: "Japan", countryCode: "JP", lat: 34.6937, lng: 135.5023, region: "asia" },
  { name: "Kyoto", country: "Japan", countryCode: "JP", lat: 35.0116, lng: 135.7681, region: "asia" },
  { name: "Yokohama", country: "Japan", countryCode: "JP", lat: 35.4437, lng: 139.6380, region: "asia" },
  { name: "Nagoya", country: "Japan", countryCode: "JP", lat: 35.1815, lng: 136.9066, region: "asia" },
  { name: "Fukuoka", country: "Japan", countryCode: "JP", lat: 33.5904, lng: 130.4017, region: "asia" },
  { name: "Sapporo", country: "Japan", countryCode: "JP", lat: 43.0618, lng: 141.3545, region: "asia" },
  { name: "Hiroshima", country: "Japan", countryCode: "JP", lat: 34.3853, lng: 132.4553, region: "asia" },

  // China
  { name: "Shanghai", country: "China", countryCode: "CN", lat: 31.2304, lng: 121.4737, region: "asia" },
  { name: "Beijing", country: "China", countryCode: "CN", lat: 39.9042, lng: 116.4074, region: "asia" },
  { name: "Shenzhen", country: "China", countryCode: "CN", lat: 22.5431, lng: 114.0579, region: "asia" },
  { name: "Guangzhou", country: "China", countryCode: "CN", lat: 23.1291, lng: 113.2644, region: "asia" },
  { name: "Chengdu", country: "China", countryCode: "CN", lat: 30.5728, lng: 104.0668, region: "asia" },
  { name: "Hangzhou", country: "China", countryCode: "CN", lat: 30.2741, lng: 120.1551, region: "asia" },
  { name: "Xian", country: "China", countryCode: "CN", lat: 34.3416, lng: 108.9398, region: "asia" },
  { name: "Chongqing", country: "China", countryCode: "CN", lat: 29.4316, lng: 106.9123, region: "asia" },

  // Hong Kong & Taiwan
  { name: "Hong Kong", country: "Hong Kong", countryCode: "HK", lat: 22.3193, lng: 114.1694, region: "asia" },
  { name: "Taipei", country: "Taiwan", countryCode: "TW", lat: 25.0330, lng: 121.5654, region: "asia" },
  { name: "Kaohsiung", country: "Taiwan", countryCode: "TW", lat: 22.6273, lng: 120.3014, region: "asia" },

  // South Korea
  { name: "Seoul", country: "South Korea", countryCode: "KR", lat: 37.5665, lng: 126.9780, region: "asia" },
  { name: "Busan", country: "South Korea", countryCode: "KR", lat: 35.1796, lng: 129.0756, region: "asia" },
  { name: "Incheon", country: "South Korea", countryCode: "KR", lat: 37.4563, lng: 126.7052, region: "asia" },
  { name: "Jeju", country: "South Korea", countryCode: "KR", lat: 33.4996, lng: 126.5312, region: "asia" },

  // Southeast Asia
  { name: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3521, lng: 103.8198, region: "asia" },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.7563, lng: 100.5018, region: "asia" },
  { name: "Chiang Mai", country: "Thailand", countryCode: "TH", lat: 18.7883, lng: 98.9853, region: "asia" },
  { name: "Phuket", country: "Thailand", countryCode: "TH", lat: 7.8804, lng: 98.3923, region: "asia" },
  { name: "Pattaya", country: "Thailand", countryCode: "TH", lat: 12.9236, lng: 100.8825, region: "asia" },
  { name: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", lat: 3.1390, lng: 101.6869, region: "asia" },
  { name: "Penang", country: "Malaysia", countryCode: "MY", lat: 5.4164, lng: 100.3327, region: "asia" },
  { name: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN", lat: 10.8231, lng: 106.6297, region: "asia" },
  { name: "Hanoi", country: "Vietnam", countryCode: "VN", lat: 21.0278, lng: 105.8342, region: "asia" },
  { name: "Da Nang", country: "Vietnam", countryCode: "VN", lat: 16.0544, lng: 108.2022, region: "asia" },
  { name: "Manila", country: "Philippines", countryCode: "PH", lat: 14.5995, lng: 120.9842, region: "asia" },
  { name: "Cebu", country: "Philippines", countryCode: "PH", lat: 10.3157, lng: 123.8854, region: "asia" },
  { name: "Jakarta", country: "Indonesia", countryCode: "ID", lat: -6.2088, lng: 106.8456, region: "asia" },
  { name: "Bali", country: "Indonesia", countryCode: "ID", lat: -8.3405, lng: 115.0920, region: "asia" },
  { name: "Yogyakarta", country: "Indonesia", countryCode: "ID", lat: -7.7956, lng: 110.3695, region: "asia" },
  { name: "Phnom Penh", country: "Cambodia", countryCode: "KH", lat: 11.5564, lng: 104.9282, region: "asia" },
  { name: "Siem Reap", country: "Cambodia", countryCode: "KH", lat: 13.3671, lng: 103.8448, region: "asia" },
  { name: "Yangon", country: "Myanmar", countryCode: "MM", lat: 16.8661, lng: 96.1951, region: "asia" },
  { name: "Vientiane", country: "Laos", countryCode: "LA", lat: 17.9757, lng: 102.6331, region: "asia" },

  // India
  { name: "Mumbai", country: "India", countryCode: "IN", lat: 19.0760, lng: 72.8777, region: "asia" },
  { name: "Delhi", country: "India", countryCode: "IN", lat: 28.6139, lng: 77.2090, region: "asia" },
  { name: "Bangalore", country: "India", countryCode: "IN", lat: 12.9716, lng: 77.5946, region: "asia" },
  { name: "Hyderabad", country: "India", countryCode: "IN", lat: 17.3850, lng: 78.4867, region: "asia" },
  { name: "Chennai", country: "India", countryCode: "IN", lat: 13.0827, lng: 80.2707, region: "asia" },
  { name: "Kolkata", country: "India", countryCode: "IN", lat: 22.5726, lng: 88.3639, region: "asia" },
  { name: "Pune", country: "India", countryCode: "IN", lat: 18.5204, lng: 73.8567, region: "asia" },
  { name: "Jaipur", country: "India", countryCode: "IN", lat: 26.9124, lng: 75.7873, region: "asia" },
  { name: "Goa", country: "India", countryCode: "IN", lat: 15.2993, lng: 74.1240, region: "asia" },
  { name: "Ahmedabad", country: "India", countryCode: "IN", lat: 23.0225, lng: 72.5714, region: "asia" },

  // South Asia
  { name: "Colombo", country: "Sri Lanka", countryCode: "LK", lat: 6.9271, lng: 79.8612, region: "asia" },
  { name: "Kathmandu", country: "Nepal", countryCode: "NP", lat: 27.7172, lng: 85.3240, region: "asia" },
  { name: "Dhaka", country: "Bangladesh", countryCode: "BD", lat: 23.8103, lng: 90.4125, region: "asia" },
  { name: "Karachi", country: "Pakistan", countryCode: "PK", lat: 24.8607, lng: 67.0011, region: "asia" },
  { name: "Lahore", country: "Pakistan", countryCode: "PK", lat: 31.5204, lng: 74.3587, region: "asia" },
  { name: "Islamabad", country: "Pakistan", countryCode: "PK", lat: 33.6844, lng: 73.0479, region: "asia" },
  { name: "Male", country: "Maldives", countryCode: "MV", lat: 4.1755, lng: 73.5093, region: "asia" },

  // Middle East
  { name: "Dubai", country: "UAE", countryCode: "AE", lat: 25.2048, lng: 55.2708, region: "asia" },
  { name: "Abu Dhabi", country: "UAE", countryCode: "AE", lat: 24.4539, lng: 54.3773, region: "asia" },
  { name: "Doha", country: "Qatar", countryCode: "QA", lat: 25.2854, lng: 51.5310, region: "asia" },
  { name: "Riyadh", country: "Saudi Arabia", countryCode: "SA", lat: 24.7136, lng: 46.6753, region: "asia" },
  { name: "Jeddah", country: "Saudi Arabia", countryCode: "SA", lat: 21.5433, lng: 39.1728, region: "asia" },
  { name: "Kuwait City", country: "Kuwait", countryCode: "KW", lat: 29.3759, lng: 47.9774, region: "asia" },
  { name: "Muscat", country: "Oman", countryCode: "OM", lat: 23.5880, lng: 58.3829, region: "asia" },
  { name: "Manama", country: "Bahrain", countryCode: "BH", lat: 26.2285, lng: 50.5860, region: "asia" },
  { name: "Tel Aviv", country: "Israel", countryCode: "IL", lat: 32.0853, lng: 34.7818, region: "asia" },
  { name: "Jerusalem", country: "Israel", countryCode: "IL", lat: 31.7683, lng: 35.2137, region: "asia" },
  { name: "Amman", country: "Jordan", countryCode: "JO", lat: 31.9454, lng: 35.9284, region: "asia" },
  { name: "Beirut", country: "Lebanon", countryCode: "LB", lat: 33.8938, lng: 35.5018, region: "asia" },
  { name: "Istanbul", country: "Turkey", countryCode: "TR", lat: 41.0082, lng: 28.9784, region: "asia" },
  { name: "Ankara", country: "Turkey", countryCode: "TR", lat: 39.9334, lng: 32.8597, region: "asia" },
  { name: "Antalya", country: "Turkey", countryCode: "TR", lat: 36.8969, lng: 30.7133, region: "asia" },
  { name: "Izmir", country: "Turkey", countryCode: "TR", lat: 38.4237, lng: 27.1428, region: "asia" },
  { name: "Tehran", country: "Iran", countryCode: "IR", lat: 35.6892, lng: 51.3890, region: "asia" },

  // Central Asia
  { name: "Almaty", country: "Kazakhstan", countryCode: "KZ", lat: 43.2220, lng: 76.8512, region: "asia" },
  { name: "Astana", country: "Kazakhstan", countryCode: "KZ", lat: 51.1694, lng: 71.4491, region: "asia" },
  { name: "Tashkent", country: "Uzbekistan", countryCode: "UZ", lat: 41.2995, lng: 69.2401, region: "asia" },
  { name: "Tbilisi", country: "Georgia", countryCode: "GE", lat: 41.7151, lng: 44.8271, region: "asia" },
  { name: "Yerevan", country: "Armenia", countryCode: "AM", lat: 40.1792, lng: 44.4991, region: "asia" },
  { name: "Baku", country: "Azerbaijan", countryCode: "AZ", lat: 40.4093, lng: 49.8671, region: "asia" },

  // ═══════════════════════════════════════════════════════════════════════════
  // AFRICA (~40 cities)
  // ═══════════════════════════════════════════════════════════════════════════

  // South Africa
  { name: "Cape Town", country: "South Africa", countryCode: "ZA", lat: -33.9249, lng: 18.4241, region: "africa" },
  { name: "Johannesburg", country: "South Africa", countryCode: "ZA", lat: -26.2041, lng: 28.0473, region: "africa" },
  { name: "Durban", country: "South Africa", countryCode: "ZA", lat: -29.8587, lng: 31.0218, region: "africa" },
  { name: "Pretoria", country: "South Africa", countryCode: "ZA", lat: -25.7461, lng: 28.1881, region: "africa" },

  // North Africa
  { name: "Cairo", country: "Egypt", countryCode: "EG", lat: 30.0444, lng: 31.2357, region: "africa" },
  { name: "Alexandria", country: "Egypt", countryCode: "EG", lat: 31.2001, lng: 29.9187, region: "africa" },
  { name: "Luxor", country: "Egypt", countryCode: "EG", lat: 25.6872, lng: 32.6396, region: "africa" },
  { name: "Sharm El Sheikh", country: "Egypt", countryCode: "EG", lat: 27.9158, lng: 34.3300, region: "africa" },
  { name: "Marrakech", country: "Morocco", countryCode: "MA", lat: 31.6295, lng: -7.9811, region: "africa" },
  { name: "Casablanca", country: "Morocco", countryCode: "MA", lat: 33.5731, lng: -7.5898, region: "africa" },
  { name: "Fez", country: "Morocco", countryCode: "MA", lat: 34.0181, lng: -5.0078, region: "africa" },
  { name: "Tangier", country: "Morocco", countryCode: "MA", lat: 35.7595, lng: -5.8340, region: "africa" },
  { name: "Tunis", country: "Tunisia", countryCode: "TN", lat: 36.8065, lng: 10.1815, region: "africa" },
  { name: "Algiers", country: "Algeria", countryCode: "DZ", lat: 36.7538, lng: 3.0588, region: "africa" },

  // East Africa
  { name: "Nairobi", country: "Kenya", countryCode: "KE", lat: -1.2921, lng: 36.8219, region: "africa" },
  { name: "Mombasa", country: "Kenya", countryCode: "KE", lat: -4.0435, lng: 39.6682, region: "africa" },
  { name: "Dar es Salaam", country: "Tanzania", countryCode: "TZ", lat: -6.7924, lng: 39.2083, region: "africa" },
  { name: "Zanzibar", country: "Tanzania", countryCode: "TZ", lat: -6.1659, lng: 39.2026, region: "africa" },
  { name: "Kampala", country: "Uganda", countryCode: "UG", lat: 0.3476, lng: 32.5825, region: "africa" },
  { name: "Kigali", country: "Rwanda", countryCode: "RW", lat: -1.9403, lng: 29.8739, region: "africa" },
  { name: "Addis Ababa", country: "Ethiopia", countryCode: "ET", lat: 9.0320, lng: 38.7469, region: "africa" },

  // West Africa
  { name: "Lagos", country: "Nigeria", countryCode: "NG", lat: 6.5244, lng: 3.3792, region: "africa" },
  { name: "Abuja", country: "Nigeria", countryCode: "NG", lat: 9.0765, lng: 7.3986, region: "africa" },
  { name: "Accra", country: "Ghana", countryCode: "GH", lat: 5.6037, lng: -0.1870, region: "africa" },
  { name: "Dakar", country: "Senegal", countryCode: "SN", lat: 14.7167, lng: -17.4677, region: "africa" },
  { name: "Abidjan", country: "Ivory Coast", countryCode: "CI", lat: 5.3600, lng: -4.0083, region: "africa" },

  // Southern & Central Africa
  { name: "Victoria Falls", country: "Zimbabwe", countryCode: "ZW", lat: -17.9243, lng: 25.8572, region: "africa" },
  { name: "Windhoek", country: "Namibia", countryCode: "NA", lat: -22.5609, lng: 17.0658, region: "africa" },
  { name: "Gaborone", country: "Botswana", countryCode: "BW", lat: -24.6282, lng: 25.9231, region: "africa" },
  { name: "Lusaka", country: "Zambia", countryCode: "ZM", lat: -15.3875, lng: 28.3228, region: "africa" },
  { name: "Maputo", country: "Mozambique", countryCode: "MZ", lat: -25.9692, lng: 32.5732, region: "africa" },
  { name: "Mauritius", country: "Mauritius", countryCode: "MU", lat: -20.3484, lng: 57.5522, region: "africa" },
  { name: "Seychelles", country: "Seychelles", countryCode: "SC", lat: -4.6796, lng: 55.4920, region: "africa" },

  // ═══════════════════════════════════════════════════════════════════════════
  // OCEANIA (~25 cities)
  // ═══════════════════════════════════════════════════════════════════════════

  // Australia
  { name: "Sydney", country: "Australia", countryCode: "AU", lat: -33.8688, lng: 151.2093, region: "oceania" },
  { name: "Melbourne", country: "Australia", countryCode: "AU", lat: -37.8136, lng: 144.9631, region: "oceania" },
  { name: "Brisbane", country: "Australia", countryCode: "AU", lat: -27.4698, lng: 153.0251, region: "oceania" },
  { name: "Perth", country: "Australia", countryCode: "AU", lat: -31.9505, lng: 115.8605, region: "oceania" },
  { name: "Adelaide", country: "Australia", countryCode: "AU", lat: -34.9285, lng: 138.6007, region: "oceania" },
  { name: "Gold Coast", country: "Australia", countryCode: "AU", lat: -28.0167, lng: 153.4000, region: "oceania" },
  { name: "Cairns", country: "Australia", countryCode: "AU", lat: -16.9186, lng: 145.7781, region: "oceania" },
  { name: "Darwin", country: "Australia", countryCode: "AU", lat: -12.4634, lng: 130.8456, region: "oceania" },
  { name: "Hobart", country: "Australia", countryCode: "AU", lat: -42.8821, lng: 147.3272, region: "oceania" },
  { name: "Canberra", country: "Australia", countryCode: "AU", lat: -35.2809, lng: 149.1300, region: "oceania" },

  // New Zealand
  { name: "Auckland", country: "New Zealand", countryCode: "NZ", lat: -36.8509, lng: 174.7645, region: "oceania" },
  { name: "Wellington", country: "New Zealand", countryCode: "NZ", lat: -41.2866, lng: 174.7756, region: "oceania" },
  { name: "Christchurch", country: "New Zealand", countryCode: "NZ", lat: -43.5321, lng: 172.6362, region: "oceania" },
  { name: "Queenstown", country: "New Zealand", countryCode: "NZ", lat: -45.0312, lng: 168.6626, region: "oceania" },
  { name: "Rotorua", country: "New Zealand", countryCode: "NZ", lat: -38.1368, lng: 176.2497, region: "oceania" },

  // Pacific Islands
  { name: "Fiji", country: "Fiji", countryCode: "FJ", lat: -18.1416, lng: 178.4419, region: "oceania" },
  { name: "Tahiti", country: "French Polynesia", countryCode: "PF", lat: -17.6509, lng: -149.4260, region: "oceania" },
  { name: "Bora Bora", country: "French Polynesia", countryCode: "PF", lat: -16.5004, lng: -151.7415, region: "oceania" },
  { name: "Samoa", country: "Samoa", countryCode: "WS", lat: -13.8333, lng: -171.7500, region: "oceania" },
  { name: "Tonga", country: "Tonga", countryCode: "TO", lat: -21.1789, lng: -175.1982, region: "oceania" },
  { name: "Vanuatu", country: "Vanuatu", countryCode: "VU", lat: -17.7333, lng: 168.3273, region: "oceania" },
  { name: "New Caledonia", country: "New Caledonia", countryCode: "NC", lat: -22.2758, lng: 166.4580, region: "oceania" },
  { name: "Guam", country: "Guam", countryCode: "GU", lat: 13.4443, lng: 144.7937, region: "oceania" },
  { name: "Palau", country: "Palau", countryCode: "PW", lat: 7.5150, lng: 134.5825, region: "oceania" },
  { name: "Papua New Guinea", country: "Papua New Guinea", countryCode: "PG", lat: -6.3149, lng: 143.9555, region: "oceania" },
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
