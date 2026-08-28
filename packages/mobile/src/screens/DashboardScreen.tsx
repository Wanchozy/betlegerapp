import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { Bet, computePNL, filterBetsByDateRange, getWeekRange, getMonthRange, getYearRange, DashboardData } from '@betledger/shared'
import { PNLSummaryCard } from '../components/PNLSummaryCard'
import { BetList } from '../components/BetList'
import { fetchBets, deleteBet } from '../api/bets'

const DEMO_USER_ID = 'demo-user'

function buildDashboard(bets: Bet[]): DashboardData {
  const now = new Date()
  const week = getWeekRange(now)
  const month = getMonthRange(now)
  const year = getYearRange(now)
  return {
    week: computePNL(filterBetsByDateRange(bets, week.start, week.end)),
    month: computePNL(filterBetsByDateRange(bets, month.start, month.end)),
    year: computePNL(filterBetsByDateRange(bets, year.start, year.end)),
    all_time: computePNL(bets),
    recent_bets: bets.slice(0, 10),
  }
}

export function DashboardScreen() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBets(DEMO_USER_ID)
      .then(setBets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteBet(id)
      setBets((prev) => prev.filter((b) => b.id !== id))
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) return <ActivityIndicator color="#10b981" style={{ marginTop: 40 }} />
  if (error) return <Text style={styles.error}>{error}</Text>

  const data = buildDashboard(bets)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.gap}>
        <PNLSummaryCard summary={data.week} title="This Week" />
        <PNLSummaryCard summary={data.month} title="This Month" />
        <PNLSummaryCard summary={data.year} title="This Year" />
        <PNLSummaryCard summary={data.all_time} title="All Time" />

        <Text style={styles.sectionTitle}>Recent Bets</Text>
        <BetList bets={data.recent_bets} onDelete={handleDelete} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  gap: {
    gap: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginTop: 8,
  },
  error: {
    padding: 16,
    color: '#f87171',
  },
})
