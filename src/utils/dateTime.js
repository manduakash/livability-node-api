/**
 * Drizzle's mysql2 `datetime()` column type calls `.toISOString()` on
 * whatever value you give it, so it must be a real JS Date object - not a
 * pre-formatted "YYYY-MM-DD HH:MM:SS" string (which is what the legacy PHP
 * `date('Y-m-d H:i:s')` produced and what earlier drafts of this codebase
 * mistakenly passed straight through).
 */

/**
 * Equivalent of the legacy:
 *   $tz = 'Asia/Kolkata';
 *   date_default_timezone_set($tz);
 *   $date1 = date('Y-m-d H:i:s');
 *
 * Returns a JS Date representing "now" - safe to pass directly into any
 * Drizzle datetime() column.
 */
export function nowIST() {
  return new Date();
}

/**
 * Parses a third-party API timestamp string (e.g. EnggEnv's
 * "2026-06-15 14:30:00" or Distronix's ISO-ish timestamp) into a JS Date
 * for datetime() columns. Falls back to "now" if the value is missing or
 * unparseable, rather than letting a bad insert silently fail.
 */
export function parseApiTimestamp(value) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
