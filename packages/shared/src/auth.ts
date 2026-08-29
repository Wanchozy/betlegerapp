/**
 * Single seam for "who is the current user".
 *
 * The app doesn't have real authentication wired up yet, so this returns a
 * fixed demo user id (a real Supabase Auth user created manually, so it
 * satisfies the `bets.user_id -> auth.users.id` foreign key). When real
 * sign-in is added, this is the only place that needs to change (e.g. call
 * `supabase.auth.getUser()`), instead of every page/screen that currently
 * hardcodes a user id.
 */
export const DEMO_USER_ID = '3acebdb9-082a-4c9f-a86e-e0ae874b4348'

export function getCurrentUserId(): string {
  return DEMO_USER_ID
}
