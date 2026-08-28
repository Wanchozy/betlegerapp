import {
  createBetsRepository,
  createMockBetsRepository,
  hasSupabaseConfig,
  sampleBets,
} from '@betledger/shared'

// Composition root: wires the shared, DI-friendly repository up to either
// the real Supabase client, or an in-memory demo repository when no
// Supabase project has been configured yet. All the actual query/business
// logic lives in @betledger/shared so it's shared with web and unit
// tested once instead of per-platform.
export const isDemoMode = !hasSupabaseConfig()

const betsApi = isDemoMode ? createMockBetsRepository(sampleBets) : createBetsRepository()

export const { fetchBets, createBet, updateBet, deleteBet } = betsApi
