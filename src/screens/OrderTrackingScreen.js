import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Alert from '../utils/alert';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api/client';
import { CANCELLED, canCancel } from '../utils/orderStatus';
import StatusStepper from '../components/StatusStepper';
import { AppButton, Card, EmptyState, Screen, SectionTitle } from '../components/ui';
import { spacing } from '../theme/colors';
import { formatDuration, formatPrice } from '../utils/pricing';

const POLL_EVERY_MS = 10000; // ask the server for the latest status every 10 s

const MESSAGES = {
  Pending: 'We have received your order and sent it to the kitchen.',
  Preparing: 'The chef is preparing your food.',
  Ready: 'Your order is ready!',
  Served: 'Enjoy your meal! 😋',
  Cancelled: 'This order was cancelled.',
};

export default function OrderTrackingScreen({ route }) {
  const { colors } = useTheme();
  const orderId = route.params?.orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  // GET /api/orders/my and pick this order out of the list.
  const loadOrder = useCallback(async () => {
    try {
      const mine = await api('/orders/my');
      setOrder(mine.find((o) => o.id === orderId) || null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const isFinished = !order || order.status === 'Served' || order.status === CANCELLED;

  // A2 Q7: the A1 fake timer is gone. Instead we poll the server every
  // 10 seconds, so when the MANAGER changes the status on another phone,
  // the customer sees it here. The interval is cleared in the cleanup.
  useEffect(() => {
    loadOrder();
    const id = setInterval(loadOrder, POLL_EVERY_MS);
    return () => clearInterval(id);
  }, [loadOrder]);

  // Elapsed-time counter, ticks every second until the order is finished.
  useEffect(() => {
    if (isFinished) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isFinished]);

  if (loading) {
    return (
      <Screen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState emoji="🧾" title={error ? 'Could not load the order' : 'Order not found'} message={error || undefined}>
          <AppButton title="Retry" onPress={loadOrder} style={{ marginTop: 12 }} />
        </EmptyState>
      </Screen>
    );
  }

  const placedAt = new Date(order.createdAt).getTime();
  const finishedAt = isFinished ? new Date(order.updatedAt).getTime() : now;
  const elapsed = finishedAt - placedAt;
  const managerUpdated = (order.history || []).some((h) => h.by === 'manager');

  const cancel = async () => {
    try {
      const updated = await api(`/orders/${order.id}/cancel`, { method: 'PATCH' });
      setOrder(updated);
    } catch (err) {
      Alert.alert('Could not cancel', err.message);
    }
  };

  const confirmCancel = () =>
    Alert.alert('Cancel order?', 'The kitchen has not started yet, so you can still cancel.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: cancel },
    ]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}>
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={[styles.status, { color: order.status === CANCELLED ? colors.danger : colors.primary }]}>{order.status}</Text>
          <Text style={{ color: colors.text, textAlign: 'center', marginBottom: spacing.lg }}>{MESSAGES[order.status]}</Text>
          <StatusStepper status={order.status} />
          <View style={styles.timer}>
            <Text style={{ color: colors.textMuted }}>Elapsed</Text>
            <Text style={[styles.timerValue, { color: colors.text }]}>{formatDuration(elapsed)}</Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
            {managerUpdated ? 'Updated by the restaurant. ' : ''}Checks for updates every 10 seconds.
          </Text>
          {error ? <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
        </Card>

        <SectionTitle>Details</SectionTitle>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 6 }}>
            {order.type === 'Dine-in' ? `Dine-in · Table ${order.tableNumber ?? '-'}` : `Takeaway · pickup ${order.pickupTime}`}
          </Text>
          {order.items.map((i, index) => (
            <Text key={`${i.menuItem}-${index}`} style={{ color: colors.textMuted, paddingVertical: 2 }}>
              {i.quantity} × {i.name}{i.note ? ` (${i.note})` : ''}
            </Text>
          ))}
          <Text style={{ color: colors.text, fontWeight: '900', marginTop: 8, fontSize: 16 }}>Total {formatPrice(order.total)}</Text>
        </Card>

        {canCancel(order.status) ? (
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
