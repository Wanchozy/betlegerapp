import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import { Bet } from '@betledger/shared'

interface Props {
  bets: Bet[]
  onDelete: (id: string) => void
}

const outcomeStyles: Record<string, { bg: string; text: string }> = {
  win: { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80' },
  loss: { bg: 'rgba(248, 113, 113, 0.1)', text: '#f87171' },
  push: { bg: 'rgba(250, 204, 21, 0.1)', text: '#facc15' },
  pending: { bg: 'rgba(107, 114, 128, 0.1)', text: '#9ca3af' },
}

export function BetList({ bets, onDelete }: Props) {
  const confirmDelete = (id: string) => {
    Alert.alert('Delete Bet', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(id) },
    ])
  }

  const renderBet = ({ item }: { item: Bet }) => {
    const os = outcomeStyles[item.outcome] ?? outcomeStyles.pending

    return (
      <View style={styles.betRow}>
        <View style={styles.betInfo}>
          <Text style={styles.event}>{item.event}</Text>
          <Text style={styles.meta}>
            {item.sport} · {item.bet_type} · {new Date(item.placed_at).toLocaleDateString()}
          </Text>
          <View style={styles.betDetails}>
            <Text style={styles.detailText}>
              {item.odds > 0 ? `+${item.odds}` : item.odds}
            </Text>
            <Text style={styles.detailText}>${item.stake.toFixed(2)}</Text>
            <View style={[styles.badge, { backgroundColor: os.bg }]}>
              <Text style={[styles.badgeText, { color: os.text }]}>{item.outcome}</Text>
            </View>
          </View>
        </View>
        <View style={styles.betActions}>
          <Text style={[styles.pnl, { color: item.profit_loss >= 0 ? '#4ade80' : '#f87171' }]}>
            {item.profit_loss >= 0 ? '+' : ''}${item.profit_loss.toFixed(2)}
          </Text>
          <TouchableOpacity onPress={() => confirmDelete(item.id)}>
            <Text style={styles.deleteBtn}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (bets.length === 0) {
    return <Text style={styles.empty}>No bets yet.</Text>
  }

  return (
    <FlatList
      data={bets}
      keyExtractor={(item) => item.id}
      renderItem={renderBet}
    />
  )
}

const styles = StyleSheet.create({
  betRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31, 41, 55, 0.5)',
    paddingVertical: 12,
  },
  betInfo: {
    flex: 1,
  },
  event: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f9fafb',
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  betDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  betActions: {
    alignItems: 'flex-end',
  },
  pnl: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteBtn: {
    fontSize: 12,
    color: '#f87171',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 32,
    color: '#6b7280',
  },
})
