import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/colors';
import { formatPrice } from '../utils/pricing';
import { Badge } from './ui';

// Wrapped in React.memo: the card only re-renders when its own props change.
// The parent passes stable handlers (useCallback) and a boolean isFavourite,
// so toggling one heart re-renders only that card.
function MenuItemCard({ item, isFavourite, quantityInCart = 0, onAdd, onToggleFavourite }) {
  const { colors } = useTheme();
  const disabled = !item.isAvailable;

  // Q8: open the console to see which cards render.
  console.log(`[MenuItemCard] render: ${item.name}`);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <View style={[styles.imageBox, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={styles.image}>{item.image}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: disabled ? colors.textMuted : colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Pressable
            hitSlop={10}
            onPress={() => onToggleFavourite(item.id)}
            accessibilityLabel={isFavourite ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`}
          >
            <Ionicons name={isFavourite ? 'heart' : 'heart-outline'} size={22} color={isFavourite ? colors.danger : colors.textMuted} />
          </Pressable>
        </View>

        {item.isSpecial ? <Badge label="⭐ Daily Special" /> : null}

        <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.price, { color: colors.text }]}>{formatPrice(item.price)}</Text>
          {disabled ? (
            <Text style={{ color: colors.textMuted, fontWeight: '700' }}>Unavailable</Text>
          ) : null}
          <Pressable
            onPress={() => onAdd(item)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name} to cart`}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: disabled ? colors.disabled : colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Ionicons name="add" size={16} color={colors.primaryText} />
            <Text style={{ color: colors.primaryText, fontWeight: '700' }}>
              {quantityInCart > 0 ? `Add (${quantityInCart})` : 'Add'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, gap: spacing.md },
  imageBox: { width: 76, height: 76, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  image: { fontSize: 40 },
  body: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '800', flexShrink: 1 },
  desc: { fontSize: 13 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontSize: 15, fontWeight: '800' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill },
});

export default memo(MenuItemCard);
