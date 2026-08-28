import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { Bet, aggregateByField, buildPeriodSummaries, getCurrentUserId } from '@betledger/shared'
import { PNLSummaryCard } from '../components/PNLSummaryCard'
import { fetchBets } from '../api/bets'

const userId = getCurrentUserId()

export function ReportsScreen() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBets(userId)
      .then(setBets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <ActivityIndicator color="#10b981" style={{ marginTop: 40 }} />
  if (error) return <Text style={styles.error}>{error}</Text>

  const summaries = buildPeriodSummaries(bets)

  const bySport = aggregateByField(bets, 'sport')
  const byType = aggregateByField(bets, 'bet_type')

  return (
    <ScrollView style={styles.container}>
      <View style={styles.gap}>
        {summaries.map((s) => (
          <PNLSummaryCard key={s.key} summary={s.summary} title={s.label} />
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
