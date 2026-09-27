import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';
import { formatPrice } from '../utils/pricing';

// Wrapped in React.memo: the card only re-renders when its own props change.
// The parent passes stable handlers (useCallback) and a boolean isFavourite,
// so toggling one heart re-renders only that card.
function MenuItemCard({ item, isFavourite, quantityInCart = 0, onAdd, onToggleFavourite }) {
  const { colors } = useTheme();
  const disabled = !item.isAvailable;

  // Q8: open the console to see which cards render.
  console.log(`[MenuItemCard] render: ${item.name}`);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Left: text */}
      <View style={styles.body}>
        {item.isSpecial ? (
          <View style={[styles.special, { backgroundColor: colors.accent }]}>
            <Ionicons name="flame" size={11} color="#3A2A00" />
            <Text style={styles.specialText}>Daily Special</Text>
          </View>
        ) : null}
        <Text style={[styles.name, { color: disabled ? colors.textMuted : colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: disabled ? colors.textMuted : colors.primary }]}>{formatPrice(item.price)}</Text>
          {disabled ? (
            <View style={[styles.soldOut, { borderColor: colors.danger }]}>
              <Text style={{ color: colors.danger, fontSize: 11, fontWeight: '800' }}>SOLD OUT</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Right: dish image with heart + add button */}
      <View style={styles.side}>
        <View style={[styles.imageBox, { backgroundColor: colors.surfaceAlt, opacity: disabled ? 0.4 : 1 }]}>
          <Text style={styles.image}>{item.image}</Text>
        </View>
        <Pressable
          hitSlop={10}
          onPress={() => onToggleFavourite(item.id)}
          style={[styles.heart, { backgroundColor: colors.surface }]}
          accessibilityLabel={isFavourite ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`}
        >
          <Ionicons name={isFavourite ? 'heart' : 'heart-outline'} size={16} color={isFavourite ? colors.danger : colors.textMuted} />
        </Pressable>
        <Pressable
          onPress={() => onAdd(item)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.name} to cart`}
          style={({ pressed }) => [
            styles.addBtn,
            {
              backgroundColor: disabled ? colors.disabled : colors.primary,
              borderColor: colors.surface,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {quantityInCart > 0 ? (
            <Text style={{ color: colors.primaryText, fontWeight: '900' }}>{quantityInCart} +</Text>
          ) : (
            <>
              <Ionicons name="add" size={16} color={colors.primaryText} />
              <Text style={{ color: colors.primaryText, fontWeight: '800' }}>ADD</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, gap: spacing.md },
  body: { flex: 1, gap: 4, justifyContent: 'center' },
  special: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill },
  specialText: { color: '#3A2A00', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  name: { fontSize: 16, fontWeight: '800' },
  desc: { fontSize: 12.5, lineHeight: 17 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '900' },
  soldOut: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  side: { width: 96, alignItems: 'center', paddingBottom: 14 },
  imageBox: { width: 96, height: 88, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  image: { fontSize: 46 },
  heart: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  addBtn: { position: 'absolute', bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 72, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 2 },
});

export default memo(MenuItemCard);
