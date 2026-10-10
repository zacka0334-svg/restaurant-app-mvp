import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import Alert from '../utils/alert';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { CLEAR_CART } from '../reducers/cartReducer';
import { AppButton, Card, EmptyState, Screen, SectionTitle } from '../components/ui';
import { spacing } from '../theme/colors';
import { SALES_TAX_RATE, SERVICE_CHARGE_RATE, computeTotals, formatPrice } from '../utils/pricing';

export default function OrderSummaryScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { state: cart, dispatch } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);

  const { orderType = 'Takeaway', tableId = null, tableNumber = null, pickupTime = null } = route.params || {};
  const table = tableId ? { number: tableNumber } : null;

  // Q8: totals recomputed only when the cart items or the discount change.
  // Typing in another screen, toggling the theme, etc. will not redo the maths.
  const totals = useMemo(
    () => computeTotals(cart.items, cart.discountPercent),
    [cart.items, cart.discountPercent]
  );

  // A2: POST /api/orders. We only send WHAT was ordered (ids, quantities,
  // notes). The server looks up the real prices and works out the total
  // itself; the totals shown above are just a preview.
  const onPlaceOrder = async () => {
    setIsPlacing(true);
    try {
      const order = await api('/orders', {
        method: 'POST',
        body: {
          items: cart.items.map((i) => ({ id: i.id, quantity: i.quantity, note: i.note })),
          type: orderType,
          tableId,
          pickupTime,
          promoCode: cart.promoCode,
        },
      });
      dispatch({ type: CLEAR_CART });
      // Replace the summary so "back" from tracking returns to the (empty) cart.
      navigation.replace('OrderTracking', { orderId: order.id });
    } catch (err) {
      Alert.alert('Could not place order', err.message);
    } finally {
      setIsPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState emoji="🧾" title="Nothing to summarise" message="Your cart is empty." />
      </Screen>
    );
  }

  const Row = ({ label, value, bold, color }) => (
    <View style={styles.row}>
      <Text style={{ color: color || (bold ? colors.text : colors.textMuted), fontWeight: bold ? '800' : '500', fontSize: bold ? 17 : 15 }}>{label}</Text>
      <Text style={{ color: color || colors.text, fontWeight: bold ? '900' : '600', fontSize: bold ? 18 : 15 }}>{value}</Text>
    </View>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}>
        <Card>
          <View style={styles.typeRow}>
            <Ionicons name={orderType === 'Dine-in' ? 'restaurant-outline' : 'bag-handle-outline'} size={22} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>
              {orderType === 'Dine-in' ? `Dine-in · Table ${table ? table.number : '-'}` : `Takeaway · pickup at ${pickupTime}`}
            </Text>
          </View>
        </Card>

        <SectionTitle>Items</SectionTitle>
        <Card>
          {cart.items.map((i) => (
            <View key={i.id} style={styles.itemLine}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{i.quantity} × {i.name}</Text>
                {i.note ? <Text style={{ color: colors.textMuted, fontSize: 12 }}>“{i.note}”</Text> : null}
              </View>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{formatPrice(i.price * i.quantity)}</Text>
            </View>
          ))}
        </Card>

        <SectionTitle>Bill</SectionTitle>
        <Card>
          <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
          {totals.discount > 0 ? (
            <Row label={`Promo ${cart.promoCode} (−${cart.discountPercent}%)`} value={`− ${formatPrice(totals.discount)}`} color={colors.success} />
          ) : null}
          <Row label={`Service charge (${SERVICE_CHARGE_RATE * 100}%)`} value={formatPrice(totals.serviceCharge)} />
          <Row label={`Sales tax (${SALES_TAX_RATE * 100}%)`} value={formatPrice(totals.salesTax)} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row label="Grand total" value={formatPrice(totals.grandTotal)} bold />
        </Card>

        <Text style={{ color: colors.textMuted, fontSize: 12, marginVertical: spacing.md }}>
          Payment is collected at the restaurant. This MVP does not process real payments.
        </Text>

        <AppButton title={`Place order · ${formatPrice(totals.grandTotal)}`} onPress={onPlaceOrder} loading={isPlacing} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemLine: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  divider: { height: 1, marginVertical: 8 },
});
