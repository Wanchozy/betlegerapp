import { createBetsRepository } from '@betledger/shared'

// Composition root: wires the shared, DI-friendly repository up to the
// real Supabase client for this app. All the actual query/business logic
// lives in @betledger/shared so it's shared with mobile and unit tested
// once instead of per-platform.
const betsApi = createBetsRepository()

export const { fetchBets, createBet, updateBet, deleteBet } = betsApi
