/**
 * Timezone Lookup API
 *
 * This server-side API endpoint looks up IANA timezone identifiers from
 * geographic coordinates (latitude/longitude) using the GeoNames API.
 *
 * Why server-side?
 * - Prevents exposing GeoNames API credentials to the client
 * - Enables caching with Next.js revalidation
 * - Provides graceful fallback to UTC if lookup fails
 *
 * GeoNames Free Tier:
 * - 15,000 requests per day
 * - Requires free account at https://www.geonames.org/login
 * - Must enable "Free Web Services" in account settings
 */

import { NextRequest, NextResponse } from 'next/server';

interface TimezoneResponse {
  timezone: string;
  error?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<TimezoneResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  // Validate parameters
  if (!lat || !lng) {
    return NextResponse.json(
      { timezone: 'UTC', error: 'Missing lat/lng parameters' },
      { status: 400 }
    );
  }

  // Validate numeric values
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { timezone: 'UTC', error: 'Invalid lat/lng values' },
      { status: 400 }
    );
  }

  if (latitude < -90 || latitude > 90) {
    return NextResponse.json(
      { timezone: 'UTC', error: 'Latitude must be between -90 and 90' },
      { status: 400 }
    );
  }

  if (longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { timezone: 'UTC', error: 'Longitude must be between -180 and 180' },
      { status: 400 }
    );
  }

  // Get GeoNames username from environment
  const username = process.env.GEONAMES_USERNAME;

  if (!username) {
    console.warn('GEONAMES_USERNAME not configured in environment variables');
    console.warn('Please sign up at https://www.geonames.org/login and add username to .env.local');
    return NextResponse.json({
      timezone: 'UTC',
      error: 'Timezone lookup not configured',
    });
  }

  try {
    // Call GeoNames timezone API
    const response = await fetch(
      `http://api.geonames.org/timezoneJSON?lat=${latitude}&lng=${longitude}&username=${username}`,
      {
        // Cache for 24 hours (timezones don't change often!)
        next: { revalidate: 86400 }
      }
    );

    if (!response.ok) {
      throw new Error(`GeoNames API returned ${response.status}`);
    }

    const data = await response.json();

    // Check for GeoNames error response
    if (data.status) {
      console.error('GeoNames API error:', data.status.message);
      throw new Error(data.status.message);
    }

    // Return timezone from response
    const timezone = data.timezoneId || 'UTC';

    return NextResponse.json({
      timezone,
    });

  } catch (error) {
    console.error('Timezone lookup failed:', error);

    // Return UTC as fallback
    return NextResponse.json(
      {
        timezone: 'UTC',
        error: error instanceof Error ? error.message : 'Lookup failed',
      },
      { status: 500 }
    );
  }
}
