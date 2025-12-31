/**
 * Timezone conversion utilities for accurate astronomical calculations
 *
 * This module handles conversion from local birth time to UTC, which is required
 * for astronomical calculations. The astronomia library expects UTC time, but users
 * provide local time in their timezone.
 *
 * Key features:
 * - Handles DST (Daylight Saving Time) transitions correctly
 * - Supports historical dates (before 1970)
 * - Works with all IANA timezones
 * - Handles edge cases like spring forward, fall back, half-hour offsets
 */

import { fromZonedTime } from 'date-fns-tz';
import { BirthData } from './types';

/**
 * Convert local birth time to UTC for astronomical calculations
 *
 * This is the core function that fixes the timezone bug. It takes a local
 * date/time in a specific timezone and converts it to UTC, which is what
 * the astronomia library requires.
 *
 * Handles all edge cases:
 * - DST transitions (e.g., 2:30 AM on "spring forward" day doesn't exist)
 * - Historical timezone rules (before 1970, when DST wasn't standardized)
 * - Half-hour offsets (India UTC+5:30, Nepal UTC+5:45)
 * - Southern Hemisphere DST (opposite season from Northern Hemisphere)
 *
 * @param date - ISO date string "YYYY-MM-DD"
 * @param time - Time string "HH:MM" (24-hour format)
 * @param timezone - IANA timezone (e.g., "America/New_York", "Asia/Tokyo")
 * @returns Date object representing the UTC moment
 *
 * @example
 * // Born 2:00 PM on May 15, 1990 in New York (EDT = UTC-4 in summer)
 * const utc = localToUTC("1990-05-15", "14:30", "America/New_York");
 * // Returns: Date object for 1990-05-15T18:30:00.000Z (6:30 PM UTC)
 *
 * @example
 * // Born 2:00 PM on December 15, 1990 in New York (EST = UTC-5 in winter)
 * const utc = localToUTC("1990-12-15", "14:30", "America/New_York");
 * // Returns: Date object for 1990-12-15T19:30:00.000Z (7:30 PM UTC)
 *
 * @example
 * // Born during DST transition (2:30 AM on spring forward day)
 * const utc = localToUTC("2024-03-10", "02:30", "America/New_York");
 * // Treats as 3:30 AM EDT (date-fns-tz handles this automatically)
 */
export function localToUTC(
  date: string,
  time: string,
  timezone: string
): Date {
  // Combine date and time into ISO string
  // This represents the local time IN the specified timezone
  const localDateTimeString = `${date}T${time}:00`;

  // fromZonedTime: "What UTC time corresponds to this local time in this zone?"
  // This function from date-fns-tz handles all the complex edge cases:
  // - DST transitions
  // - Historical timezone rules
  // - Half-hour/quarter-hour offsets
  const utcDate = fromZonedTime(localDateTimeString, timezone);

  return utcDate;
}

/**
 * Validate IANA timezone string
 *
 * Checks if a timezone string is a valid IANA timezone identifier.
 * Examples of valid timezones:
 * - "America/New_York"
 * - "Europe/London"
 * - "Asia/Tokyo"
 * - "Australia/Sydney"
 *
 * Examples of INVALID timezones:
 * - "EST" (abbreviation, not full IANA name)
 * - "UTC-5" (offset, not IANA name)
 * - "New York" (not in IANA format)
 *
 * @param timezone - Timezone string to validate
 * @returns true if valid IANA timezone, false otherwise
 *
 * @example
 * isValidTimezone("America/New_York") // true
 * isValidTimezone("EST") // false (abbreviation)
 * isValidTimezone("UTC-5") // false (offset)
 */
export function isValidTimezone(timezone: string): boolean {
  if (!timezone) return false;

  try {
    // Try to format a date with this timezone
    // If timezone is invalid, this will throw an error
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate birth data timezone
 *
 * Returns validation error message or null if valid.
 * Used in API routes to validate requests before processing.
 *
 * @param birthData - Birth data object containing timezone
 * @returns Error message string if invalid, null if valid
 *
 * @example
 * const error = validateBirthDataTimezone(birthData);
 * if (error) {
 *   return NextResponse.json({ error }, { status: 400 });
 * }
 */
export function validateBirthDataTimezone(birthData: BirthData): string | null {
  if (!birthData.location.timezone) {
    return 'Timezone is required';
  }

  if (!isValidTimezone(birthData.location.timezone)) {
    return `Invalid timezone: ${birthData.location.timezone}`;
  }

  // Check for common mistake: UTC offset instead of IANA name
  if (/^UTC[+-]\d/.test(birthData.location.timezone)) {
    return 'Please use IANA timezone name (e.g., "America/New_York") not UTC offset';
  }

  return null; // Valid!
}

/**
 * Get human-readable timezone offset for a specific date
 *
 * Accounts for DST changes - the offset can be different in summer vs winter.
 *
 * @param date - ISO date string "YYYY-MM-DD"
 * @param timezone - IANA timezone
 * @returns Formatted offset string like "UTC-5 (EST)" or "UTC-4 (EDT)"
 *
 * @example
 * getTimezoneOffset("1990-05-15", "America/New_York") // "GMT-4 (EDT)"
 * getTimezoneOffset("1990-12-15", "America/New_York") // "GMT-5 (EST)"
 */
export function getTimezoneOffset(date: string, timezone: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const testDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  // Get timezone abbreviation (e.g., "EST", "EDT", "JST")
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  });

  const parts = formatter.formatToParts(testDate);
  const tzName = parts.find(p => p.type === 'timeZoneName')?.value || '';

  // Get numeric offset (e.g., "GMT-5", "GMT+9")
  const offsetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });

  const offsetParts = offsetFormatter.formatToParts(testDate);
  const offsetStr = offsetParts.find(p => p.type === 'timeZoneName')?.value || '';

  return `${offsetStr} (${tzName})`;
}
