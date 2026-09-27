import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';
import { AppButton, EmptyState, Screen } from '../components/ui';
import { radius, spacing } from '../theme/colors';
import { formatPrice } from '../utils/pricing';

export function statusColor(status, colors) {
  switch (status) {
    case 'Pending': return colors.accent;
    case 'Preparing': return colors.primary;
    case 'Ready': return colors.success;
    case 'Served': return colors.textMuted;
    default: return colors.danger;
  }
}

// Customer's order history; tapping an order opens Order Tracking.
export default function MyOrdersScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { orders } = useOrders();

  const myOrders = useMemo(() => orders.filter((o) => o.customerId === user?.id), [orders, user]);

  if (myOrders.length === 0) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState emoji="🧾" title="No orders yet" message="Orders you place will appear here so you can track them.">
          <AppButton title="Browse menu" onPress={() => navigation.navigate('MenuTab')} style={{ marginTop: 12 }} />
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={myOrders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '800' }}>{item.id} · {item.type}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {new Date(item.timestamp).toLocaleString()} · {item.items.reduce((s, i) => s + i.quantity, 0)} item(s)
              </Text>
              <Text style={{ color: colors.text, fontWeight: '700', marginTop: 2 }}>{formatPrice(item.total)}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: statusColor(item.status, colors) }]}>
              <Text style={styles.pillText}>{item.status}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderRadius: radius.md, marginBottom: spacing.md },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { color: '#fff', fontWeight: '800', fontSize: 12 },
});
