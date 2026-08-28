import { afterEach, describe, expect, it } from 'vitest'
import { hasSupabaseConfig } from './supabase'

const ENV_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
] as const

function clearEnv() {
  for (const key of ENV_KEYS) delete process.env[key]
}

describe('hasSupabaseConfig', () => {
  afterEach(() => {
    clearEnv()
  })

  it('returns false when no relevant env vars are set', () => {
    clearEnv()
    expect(hasSupabaseConfig()).toBe(false)
  })

  it('returns true when Vite-style env vars are set', () => {
    clearEnv()
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co'
    process.env.VITE_SUPABASE_ANON_KEY = 'anon-key'
    expect(hasSupabaseConfig()).toBe(true)
  })

  it('returns true when Expo-style env vars are set', () => {
    clearEnv()
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    expect(hasSupabaseConfig()).toBe(true)
  })

  it('returns false when only the URL or only the key is set', () => {
    clearEnv()
    process.env.VITE_SUPABASE_URL = 'https://example.supabase.co'
    expect(hasSupabaseConfig()).toBe(false)

    clearEnv()
    process.env.VITE_SUPABASE_ANON_KEY = 'anon-key'
    expect(hasSupabaseConfig()).toBe(false)
  })
})
