import { createClient, SupabaseClient } from '@supabase/supabase-js'

declare const process: { env: Record<string, string | undefined> } | undefined

function getEnv(name: string): string | undefined {
  if (typeof import.meta !== 'undefined') {
    const env = (import.meta as Record<string, any>).env
    const value = env?.[name]
    if (value !== undefined) return value
  }
  if (typeof process !== 'undefined' && process?.env) {
    return process.env[name]
  }
  return undefined
}

function readSupabaseConfig(): { url: string | undefined; anonKey: string | undefined } {
  return {
    url: getEnv('VITE_SUPABASE_URL') ?? getEnv('EXPO_PUBLIC_SUPABASE_URL'),
    anonKey: getEnv('VITE_SUPABASE_ANON_KEY') ?? getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  }
}

/**
 * Whether Supabase environment variables are configured. Callers (e.g. the
 * web/mobile composition roots) use this to decide whether to talk to a
 * real Supabase project or fall back to the in-memory demo repository.
 */
export function hasSupabaseConfig(): boolean {
  const { url, anonKey } = readSupabaseConfig()
  return Boolean(url && anonKey)
}

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const { url: supabaseUrl, anonKey: supabaseAnonKey } = readSupabaseConfig()

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. ' +
        'Create a packages/web/.env file with:\n' +
        'VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
        'VITE_SUPABASE_ANON_KEY=your-anon-key'
      )
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}
