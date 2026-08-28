import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { Bet, PNLSummary, computePNL, filterBetsByDateRange, getWeekRange, getMonthRange, getYearRange } from '@betledger/shared'
import { PNLSummaryCard } from '../components/PNLSummaryCard'
import { fetchBets } from '../api/bets'

const DEMO_USER_ID = 'demo-user'

const periods = [
  { key: 'week', label: 'This Week', getRange: getWeekRange },
  { key: 'month', label: 'This Month', getRange: getMonthRange },
  { key: 'year', label: 'This Year', getRange: getYearRange },
  { key: 'all', label: 'All Time', getRange: () => ({ start: new Date(0), end: new Date() }) },
]

export function ReportsScreen() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBets(DEMO_USER_ID)
      .then(setBets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <ActivityIndicator color="#10b981" style={{ marginTop: 40 }} />
  if (error) return <Text style={styles.error}>{error}</Text>

  const summaries: { label: string; summary: PNLSummary }[] = periods.map((p) => {
    const { start, end } = p.getRange(new Date())
    return { label: p.label, summary: computePNL(filterBetsByDateRange(bets, start, end)) }
  })

  const bySport = aggregate(bets, 'sport')
  const byType = aggregate(bets, 'bet_type')

  return (
    <ScrollView style={styles.container}>
      <View style={styles.gap}>
        {summaries.map((s) => (
          <PNLSummaryCard key={s.label} summary={s.summary} title={s.label} />
        ))}

        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>By Sport</Text>
          {bySport.map((d) => (
            <View key={d.label} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{d.label} ({d.count})</Text>
              <Text style={[styles.breakdownValue, { color: d.profit >= 0 ? '#4ade80' : '#f87171' }]}>
                {d.profit >= 0 ? '+' : ''}${d.profit.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>By Bet Type</Text>
          {byType.map((d) => (
            <View key={d.label} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{d.label} ({d.count})</Text>
              <Text style={[styles.breakdownValue, { color: d.profit >= 0 ? '#4ade80' : '#f87171' }]}>
                {d.profit >= 0 ? '+' : ''}${d.profit.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

function aggregate(bets: Bet[], field: 'sport' | 'bet_type') {
  const map = new Map<string, { count: number; profit: number }>()
  for (const b of bets) {
    const key = b[field]
    const entry = map.get(key) ?? { count: 0, profit: 0 }
    entry.count++
    entry.profit += b.profit_loss
    map.set(key, entry)
  }
  return Array.from(map.entries())
    .map(([label, stats]) => ({ label, ...stats }))
    .sort((a, b) => b.profit - a.profit)
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
  error: {
    padding: 16,
    color: '#f87171',
  },
  breakdown: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#111827',
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#d1d5db',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
  },
})
