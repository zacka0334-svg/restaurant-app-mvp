import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import {
  APPLY_PROMO, CLEAR_CART, DECREMENT, INCREMENT, REMOVE_ITEM, REMOVE_PROMO, UPDATE_NOTE, isValidPromo,
} from '../reducers/cartReducer';
import { AppButton, Card, EmptyState, Field, Screen, SectionTitle } from '../components/ui';
import { radius, spacing } from '../theme/colors';
import { formatPrice } from '../utils/pricing';

export default function CartScreen({ navigation }) {
  const { colors } = useTheme();
  const { state, dispatch, itemCount } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');


  const subtotal = useMemo(() => state.items.reduce((s, i) => s + i.price * i.quantity, 0), [state.items]);

  const applyPromo = () => {
    if (!promoInput.trim()) {
      setPromoError('Enter a promo code.');
      return;
    }
    if (!isValidPromo(promoInput)) {
      setPromoError(`“${promoInput.trim().toUpperCase()}” is not a valid promo code.`);
      return;
    }
    dispatch({ type: APPLY_PROMO, payload: { code: promoInput } });
    setPromoError('');
    setPromoInput('');
  };

  const confirmClear = () =>
    Alert.alert('Clear cart?', 'This removes every item from your cart.', [
      { text: 'Keep items', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => dispatch({ type: CLEAR_CART }) },
    ]);

  if (state.items.length === 0) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState emoji="🛒" title="Your cart is empty" message="Add something tasty from the menu.">
          <AppButton title="Browse menu" onPress={() => navigation.navigate('MenuTab')} style={{ marginTop: 12 }} />
        </EmptyState>
      </Screen>
    );
  }

  const renderItem = ({ item }) => (
    <Card style={{ marginBottom: spacing.md }}>
      <View style={styles.itemRow}>
        <Text style={{ fontSize: 30 }}>{item.image}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
          <Text style={{ color: colors.textMuted }}>{formatPrice(item.price)} each</Text>
        </View>
        <Pressable
          onPress={() => dispatch({ type: REMOVE_ITEM, payload: { id: item.id } })}
          hitSlop={8}
          accessibilityLabel={`Remove ${item.name}`}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </Pressable>
      </View>

      <View style={[styles.itemRow, { marginTop: spacing.sm }]}>
        <View style={[styles.stepper, { borderColor: colors.border }]}>
          <Pressable onPress={() => dispatch({ type: DECREMENT, payload: { id: item.id } })} style={styles.stepBtn} accessibilityLabel="Decrease quantity">
            <Ionicons name="remove" size={18} color={colors.text} />
          </Pressable>
          <Text style={[styles.qty, { color: colors.text }]}>{item.quantity}</Text>
          <Pressable onPress={() => dispatch({ type: INCREMENT, payload: { id: item.id } })} style={styles.stepBtn} accessibilityLabel="Increase quantity">
            <Ionicons name="add" size={18} color={colors.text} />
          </Pressable>
        </View>
        <Text style={[styles.lineTotal, { color: colors.text }]}>{formatPrice(item.price * item.quantity)}</Text>
      </View>

      <TextInput
        value={item.note}
        onChangeText={(note) => dispatch({ type: UPDATE_NOTE, payload: { id: item.id, note } })}
        placeholder="Special instructions (e.g. no onions)"
        placeholderTextColor={colors.textMuted}
        style={[styles.note, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}
      />
    </Card>
  );

  const footer = (
    <View>
      {/* Promo code */}
      <SectionTitle>Promo code</SectionTitle>
      {state.promoCode ? (
        <View style={[styles.promoApplied, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="pricetag" size={18} color={colors.success} />
          <Text style={{ color: colors.text, flex: 1, fontWeight: '700' }}>
            {state.promoCode} applied: {state.discountPercent}% off
          </Text>
          <Pressable onPress={() => dispatch({ type: REMOVE_PROMO })}>
            <Text style={{ color: colors.danger, fontWeight: '700' }}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.promoRow}>
          <Field
            style={{ flex: 1, marginBottom: 0 }}
            value={promoInput}
            onChangeText={(t) => { setPromoInput(t); setPromoError(''); }}
            placeholder="WELCOME10 or FEAST20"
            autoCapitalize="characters"
            error={promoError}
          />
          <AppButton title="Apply" onPress={applyPromo} style={{ marginLeft: spacing.sm }} />
        </View>
      )}

      <View style={[styles.totalRow, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textMuted }}>{itemCount} item(s) · subtotal</Text>
        <Text style={[styles.total, { color: colors.text }]}>{formatPrice(subtotal)}</Text>
      </View>

      <AppButton
        title="Review order"
        onPress={() => navigation.navigate('OrderSummary')}
        icon={<Ionicons name="receipt-outline" size={18} color={colors.primaryText} />}
      />
      <AppButton title="Clear cart" variant="outline" onPress={confirmClear} style={{ marginTop: spacing.sm }} />
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={state.items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListFooterComponent={footer}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemName: { fontSize: 16, fontWeight: '800' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.pill },
  stepBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  qty: { minWidth: 24, textAlign: 'center', fontWeight: '800', fontSize: 16 },
  lineTotal: { marginLeft: 'auto', fontWeight: '800', fontSize: 16 },
  note: { marginTop: spacing.sm, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.md, minHeight: 40 },
  promoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  promoApplied: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.md, borderRadius: radius.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, marginTop: spacing.lg, paddingVertical: spacing.md },
  total: { fontSize: 20, fontWeight: '900' },
});
