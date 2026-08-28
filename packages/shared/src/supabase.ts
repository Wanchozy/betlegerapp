import { createClient, SupabaseClient } from '@supabase/supabase-js'

declare const process: { env: Record<string, string | undefined> } | undefined

function getEnv(name: string): string | undefined {
  if (typeof import.meta !== 'undefined') {
    const env = (import.meta as Record<string, any>).env
    if (env) return env[name]
  }
  if (typeof process !== 'undefined' && process?.env) {
    return process.env[name]
  }
  return undefined
}

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = getEnv('VITE_SUPABASE_URL') ?? getEnv('EXPO_PUBLIC_SUPABASE_URL')
    const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') ?? getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY')

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
