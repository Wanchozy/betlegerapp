import { View, Text, StyleSheet } from 'react-native'
import { PNLSummary } from '@betledger/shared'

interface Props {
  summary: PNLSummary
  title: string
}

export function PNLSummaryCard({ summary, title }: Props) {
  const isPositive = summary.total_profit_loss >= 0

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.label}>Stake</Text>
          <Text style={styles.value}>${summary.total_stake.toFixed(2)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>P&L</Text>
          <Text style={[styles.value, { color: isPositive ? '#4ade80' : '#f87171' }]}>
            {isPositive ? '+' : ''}${summary.total_profit_loss.toFixed(2)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>Win Rate</Text>
          <Text style={styles.value}>{(summary.win_rate * 100).toFixed(1)}%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label}>ROI</Text>
          <Text style={[styles.value, { color: summary.roi >= 0 ? '#4ade80' : '#f87171' }]}>
            {(summary.roi * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
      <Text style={styles.footer}>
        {summary.wins}W · {summary.losses}L · {summary.pushes}P · {summary.total_bets} total
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#111827',
    padding: 16,
  },
  title: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  stat: {
    minWidth: 70,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb',
  },
  footer: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
})
