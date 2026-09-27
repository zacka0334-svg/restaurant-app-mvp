import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ORDER_STATUSES } from '../reducers/ordersReducer';

const ICONS = { Pending: 'receipt-outline', Preparing: 'flame-outline', Ready: 'bag-check-outline', Served: 'restaurant-outline' };

// Step progress indicator for the order lifecycle.
export default function StatusStepper({ status }) {
  const { colors } = useTheme();
  const cancelled = status === 'Cancelled';
  const current = ORDER_STATUSES.indexOf(status);

  return (
    <View style={styles.row}>
      {ORDER_STATUSES.map((step, i) => {
        const done = !cancelled && i <= current;
        const color = cancelled ? colors.disabled : done ? colors.primary : colors.border;
        return (
          <React.Fragment key={step}>
            <View style={styles.step}>
              <View style={[styles.dot, { backgroundColor: done ? colors.primary : colors.surface, borderColor: color }]}>
                <Ionicons name={ICONS[step]} size={18} color={done ? colors.primaryText : colors.textMuted} />
              </View>
              <Text style={[styles.label, { color: done ? colors.text : colors.textMuted }]}>{step}</Text>
            </View>
            {i < ORDER_STATUSES.length - 1 ? (
              <View style={[styles.line, { backgroundColor: !cancelled && i < current ? colors.primary : colors.border }]} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  step: { alignItems: 'center', width: 66 },
  dot: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '700', marginTop: 6 },
  line: { flex: 1, height: 3, marginTop: 18, borderRadius: 2 },
});
