import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useOrders } from '../context/OrdersContext';
import { useTheme } from '../context/ThemeContext';
import { mockTables } from '../data/tables';
import { CANCELLED, ORDER_STATUSES, nextStatus } from '../reducers/ordersReducer';
import StatusStepper from '../components/StatusStepper';
import { AppButton, Card, EmptyState, Screen, SectionTitle } from '../components/ui';
import { spacing } from '../theme/colors';
import { formatDuration, formatPrice } from '../utils/pricing';

// Demo timings (ms after the order was placed).
export const AUTO_PROGRESS = { Preparing: 10000, Ready: 20000, Served: 30000 };

const MESSAGES = {
  Pending: 'We have received your order and sent it to the kitchen.',
  Preparing: 'The chef is preparing your food.',
  Ready: 'Your order is ready!',
  Served: 'Enjoy your meal! 😋',
  Cancelled: 'This order was cancelled.',
};

// Which status the order should have reached after `elapsed` ms.
function targetStatus(elapsed) {
  if (elapsed >= AUTO_PROGRESS.Served) return 'Served';
  if (elapsed >= AUTO_PROGRESS.Ready) return 'Ready';
  if (elapsed >= AUTO_PROGRESS.Preparing) return 'Preparing';
  return 'Pending';
}

export default function OrderTrackingScreen({ route }) {
  const { colors } = useTheme();
  const { orders, updateStatus, cancelOrder } = useOrders();
  const order = orders.find((o) => o.id === route.params?.orderId);

  const [now, setNow] = useState(Date.now());
  const isFinished = !order || order.status === 'Served' || order.status === CANCELLED;

  // Timer 1: running elapsed-time counter, ticks every second.
  useEffect(() => {
    if (isFinished) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id); // cleanup
  }, [isFinished]);

  // Timer 2: moves the status forward automatically (Pending -> Preparing
  // -> Ready -> Served). Stops if a manager has changed the status by hand.
  const orderId = order?.id;
  const status = order?.status;
  const timestamp = order?.timestamp;
  const manualOverride = order?.manualOverride;
  useEffect(() => {
    if (!orderId || isFinished || manualOverride) return undefined;
    const id = setInterval(() => {
      const next = nextStatus(status);
      const target = targetStatus(Date.now() - timestamp);
      if (next && ORDER_STATUSES.indexOf(target) >= ORDER_STATUSES.indexOf(next)) {
        updateStatus(orderId, next, 'system');
      }
    }, 1000);
    return () => clearInterval(id); // cleanup
  }, [orderId, status, timestamp, manualOverride, isFinished, updateStatus]);

  if (!order) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState emoji="🧾" title="Order not found" />
      </Screen>
    );
  }

  const finishedAt = isFinished ? order.history?.[order.history.length - 1]?.at || now : now;
  const elapsed = finishedAt - order.timestamp;
  const table = mockTables.find((t) => t.id === order.tableId);

  const confirmCancel = () =>
    Alert.alert('Cancel order?', 'The kitchen has not started yet, so you can still cancel.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: () => cancelOrder(order.id, 'customer') },
    ]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}>
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Order {order.id}</Text>
          <Text style={[styles.status, { color: order.status === CANCELLED ? colors.danger : colors.primary }]}>{order.status}</Text>
          <Text style={{ color: colors.text, textAlign: 'center', marginBottom: spacing.lg }}>{MESSAGES[order.status]}</Text>
          <StatusStepper status={order.status} />
          <View style={styles.timer}>
            <Text style={{ color: colors.textMuted }}>Elapsed</Text>
            <Text style={[styles.timerValue, { color: colors.text }]}>{formatDuration(elapsed)}</Text>
          </View>
          {order.manualOverride ? (
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Status is now being updated by the restaurant manager.</Text>
          ) : null}
        </Card>

        <SectionTitle>Details</SectionTitle>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 6 }}>
            {order.type === 'Dine-in' ? `Dine-in · Table ${table ? table.number : '-'}` : `Takeaway · pickup ${order.pickupTime}`}
          </Text>
          {order.items.map((i) => (
            <Text key={i.id} style={{ color: colors.textMuted, paddingVertical: 2 }}>
              {i.quantity} × {i.name}{i.note ? ` (${i.note})` : ''}
            </Text>
          ))}
          <Text style={{ color: colors.text, fontWeight: '900', marginTop: 8, fontSize: 16 }}>Total {formatPrice(order.total)}</Text>
        </Card>

        {order.status === 'Pending' ? (
          <AppButton title="Cancel order" variant="outline" onPress={confirmCancel} style={{ marginTop: spacing.lg }} />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { fontSize: 30, fontWeight: '900', marginVertical: 6 },
  timer: { alignItems: 'center', marginTop: spacing.lg },
  timerValue: { fontSize: 28, fontWeight: '900', fontVariant: ['tabular-nums'] },
});
