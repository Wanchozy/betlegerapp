import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { DashboardScreen } from './src/screens/DashboardScreen'
import { BetsScreen } from './src/screens/BetsScreen'
import { ReportsScreen } from './src/screens/ReportsScreen'
import { isDemoMode } from './src/api/bets'

const Tab = createBottomTabNavigator()

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '📊',
    Bets: '📋',
    Reports: '📈',
  }
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '•'}
    </Text>
  )
}

function DemoModeBanner() {
  if (!isDemoMode) return null
  return (
    <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingVertical: 6, paddingHorizontal: 12 }}>
      <Text style={{ color: '#f59e0b', fontSize: 11, textAlign: 'center' }}>
        Demo mode: showing sample data. Add EXPO_PUBLIC_SUPABASE_* env vars to use a real database.
      </Text>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <DemoModeBanner />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
          tabBarActiveTintColor: '#10b981',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: { backgroundColor: '#111827', borderTopColor: '#1f2937' },
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#10b981',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Bets" component={BetsScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  )
}
