/**
 * TEMPORARY: Auth bypass for testing
 *
 * When enabled, APIs will use a test user instead of requiring authentication.
 * Set BYPASS_AUTH to false to re-enable real authentication.
 */

/**
 * Auth bypass flag
 * Set to false to enable real authentication
 */
export const BYPASS_AUTH = true;

/**
 * Test user ID for bypassing auth
 * This should be a real user in your database with a profile
 */
export const TEST_USER_ID = "d166171f-d5e8-44f3-98a5-72b40d79e573"; // dev@stellaplus.app

/**
 * Get user ID for API routes
 * Returns test user when auth is bypassed, otherwise returns the authenticated user
 */
export function getEffectiveUserId(authenticatedUserId: string | null | undefined): string | null {
  if (BYPASS_AUTH) {
    return TEST_USER_ID;
  }
  return authenticatedUserId || null;
}
