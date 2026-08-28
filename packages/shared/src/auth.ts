/**
 * Single seam for "who is the current user".
 *
 * The app doesn't have real authentication wired up yet, so this returns a
 * fixed demo user id. When Supabase Auth is added, this is the only place
 * that needs to change (e.g. call `supabase.auth.getUser()`), instead of
 * every page/screen that currently hardcodes a user id.
 */
export const DEMO_USER_ID = 'demo-user'

export function getCurrentUserId(): string {
  return DEMO_USER_ID
}
