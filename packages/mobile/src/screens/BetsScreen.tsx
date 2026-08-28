import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet,
} from 'react-native'
import { Bet, BetFormData } from '@betledger/shared'
import { BetList } from '../components/BetList'
import { fetchBets, createBet, deleteBet } from '../api/bets'

const DEMO_USER_ID = 'demo-user'

const outcomeBtns = [
  { key: 'pending' as const, label: 'Pending', color: '#6b7280' },
  { key: 'win' as const, label: 'Win', color: '#4ade80' },
  { key: 'loss' as const, label: 'Loss', color: '#f87171' },
  { key: 'push' as const, label: 'Push', color: '#facc15' },
]

export function BetsScreen() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState<BetFormData>({
    sport: 'NFL',
    event: '',
    bet_type: 'moneyline',
    odds: 0,
    stake: 0,
    outcome: 'pending',
    placed_at: new Date().toISOString().slice(0, 16),
    notes: '',
  })

  useEffect(() => {
    fetchBets(DEMO_USER_ID)
      .then(setBets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!form.event.trim()) {
      Alert.alert('Validation', 'Event name is required')
      return
    }
    try {
      const bet = await createBet(DEMO_USER_ID, form)
      setBets((prev) => [bet, ...prev])
      setShowForm(false)
      setForm({
        sport: 'NFL',
        event: '',
        bet_type: 'moneyline',
        odds: 0,
        stake: 0,
        outcome: 'pending',
        placed_at: new Date().toISOString().slice(0, 16),
        notes: '',
      })
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBet(id)
      setBets((prev) => prev.filter((b) => b.id !== id))
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <ScrollView style={styles.container}>
      {!showForm ? (
        <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ New Bet</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.form}>
          <Text style={styles.formTitle}>New Bet</Text>

          <TextInput
            placeholder="Event (e.g. Chiefs vs Eagles)"
            placeholderTextColor="#6b7280"
            value={form.event}
            onChangeText={(text) => setForm({ ...form, event: text })}
            style={styles.input}
          />

          <View style={styles.row}>
            <TextInput
              placeholder="Odds"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={String(form.odds)}
              onChangeText={(text) => setForm({ ...form, odds: Number(text) || 0 })}
              style={[styles.input, { flex: 1 }]}
            />
            <TextInput
              placeholder="Stake"
              placeholderTextColor="#6b7280"
              keyboardType="decimal-pad"
              value={String(form.stake)}
              onChangeText={(text) => setForm({ ...form, stake: Number(text) || 0 })}
              style={[styles.input, { flex: 1 }]}
            />
          </View>

          <View style={styles.outcomeRow}>
            {outcomeBtns.map((btn) => (
              <TouchableOpacity
                key={btn.key}
                onPress={() => setForm({ ...form, outcome: btn.key })}
                style={[
                  styles.outcomeBtn,
                  form.outcome === btn.key && { backgroundColor: btn.color },
                ]}
              >
                <Text style={styles.outcomeBtnText}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowForm(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator color="#10b981" />
      ) : (
        <BetList bets={bets} onDelete={handleDelete} />
      )}
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
  addBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addBtnText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#fff',
    fontSize: 16,
  },
  form: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#111827',
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 12,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#1f2937',
    padding: 12,
    fontSize: 14,
    color: '#f9fafb',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  outcomeBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: '#1f2937',
    alignItems: 'center',
  },
  outcomeBtnText: {
    fontSize: 12,
    color: '#f9fafb',
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontWeight: '600',
    color: '#fff',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontWeight: '600',
    color: '#d1d5db',
  },
  error: {
    marginBottom: 8,
    fontSize: 14,
    color: '#f87171',
  },
})
