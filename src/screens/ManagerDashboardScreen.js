import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Alert from '../utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { categories } from '../data/categories';
import { CANCELLED, canCancel, nextStatus } from '../utils/orderStatus';
import { api } from '../api/client';
import useApi from '../hooks/useApi';
import useRefetchOnFocus from '../hooks/useRefetchOnFocus';
import useForm from '../hooks/useForm';
import { AppButton, Card, Chip, EmptyState, Field, Screen, SectionTitle } from '../components/ui';
import { statusColor } from './MyOrdersScreen';
import { radius, spacing } from '../theme/colors';
import { formatPrice } from '../utils/pricing';

const TABS = [
  { key: 'orders', label: 'Orders' },
  { key: 'reservations', label: 'Bookings' },
  { key: 'menu', label: 'Menu' },
];

// ---------------------------------------------------------------- Orders tab
// Runs a server call, then reloads the list from the server (A2 Q6.5).
async function runAndReload(request, reload) {
  try {
    await request();
  } catch (err) {
    Alert.alert('Not saved', err.message); // e.g. 400 from the server's status rules
  } finally {
    reload({ silent: true });
  }
}

function OrdersTab({ orders, reload, refreshing, onRefresh }) {
  const { colors } = useTheme();
  const [showAll, setShowAll] = useState(false);

  // PATCH /api/orders/:id/status
  const updateStatus = (id, status) =>
    runAndReload(() => api(`/orders/${id}/status`, { method: 'PATCH', body: { status } }), reload);

  const list = useMemo(
    () => (showAll ? orders : orders.filter((o) => o.status !== 'Served' && o.status !== CANCELLED)),
    [orders, showAll]
  );

  return (
    <FlatList
      data={list}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.pad}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={
        <View style={styles.rowBetween}>
          <Text style={{ color: colors.textMuted }}>{list.length} order(s)</Text>
          <View style={styles.row}>
            <Text style={{ color: colors.textMuted, marginRight: 6 }}>Show completed</Text>
            <Switch value={showAll} onValueChange={setShowAll} trackColor={{ true: colors.primary, false: colors.border }} />
          </View>
        </View>
      }
      ListEmptyComponent={<EmptyState emoji="👨‍🍳" title="No active orders" message="New customer orders will appear here." />}
      renderItem={({ item: o }) => {
        const next = nextStatus(o.status);
        return (
          <Card style={{ marginBottom: spacing.md }}>
            <View style={styles.rowBetween}>
              <Text style={{ color: colors.text, fontWeight: '900' }}>#{o.id.slice(-6).toUpperCase()}</Text>
              <View style={[styles.pill, { backgroundColor: statusColor(o.status, colors) }]}>
                <Text style={styles.pillText}>{o.status}</Text>
              </View>
            </View>
            <Text style={{ color: colors.textMuted, marginVertical: 4 }}>
              {o.customerName} · {o.type === 'Dine-in' ? `Table ${o.tableNumber ?? '-'}` : `Pickup ${o.pickupTime}`} · {new Date(o.createdAt).toLocaleTimeString()}
            </Text>
            {o.items.map((i, index) => (
              <Text key={`${i.menuItem}-${index}`} style={{ color: colors.text }}>
                {i.quantity} × {i.name}{i.note ? `  ·  “${i.note}”` : ''}
              </Text>
            ))}
            <Text style={{ color: colors.text, fontWeight: '800', marginTop: 6 }}>{formatPrice(o.total)}</Text>
            <View style={[styles.row, { marginTop: spacing.sm, gap: spacing.sm, flexWrap: 'wrap' }]}>
              {next ? <AppButton small title={`Mark ${next}`} onPress={() => updateStatus(o.id, next)} /> : null}
              {canCancel(o.status) ? (
                <AppButton small title="Cancel" variant="outline" onPress={() => updateStatus(o.id, CANCELLED)} />
              ) : null}
            </View>
          </Card>
        );
      }}
    />
  );
}

// ---------------------------------------------------------- Reservations tab
function ReservationsTab({ reservations, reload, refreshing, onRefresh }) {
  const { colors } = useTheme();

  const sorted = useMemo(
    // Pending requests first, then by date and time.
    () =>
      [...reservations].sort((a, b) => {
        const pa = a.status === 'Pending' ? 0 : 1;
        const pb = b.status === 'Pending' ? 0 : 1;
        return pa - pb || (a.date + a.time).localeCompare(b.date + b.time);
      }),
    [reservations]
  );

  // PATCH /api/reservations/:id  { status: 'Accepted' | 'Declined' }
  const setStatus = (id, status) =>
    runAndReload(() => api(`/reservations/${id}`, { method: 'PATCH', body: { status } }), reload);

  return (
    <FlatList
      data={sorted}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.pad}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={<EmptyState emoji="📅" title="No reservations" />}
      renderItem={({ item: r }) => (
        <Card style={{ marginBottom: spacing.md }}>
          <View style={styles.rowBetween}>
            <Text style={{ color: colors.text, fontWeight: '900' }}>{r.date} · {r.time}</Text>
            <Text style={{ color: r.status === 'Pending' ? colors.accent : r.status === 'Accepted' ? colors.success : colors.danger, fontWeight: '800' }}>
              {r.status}
            </Text>
          </View>
          <Text style={{ color: colors.textMuted, marginVertical: 4 }}>
            {r.name} · {r.phone} · {r.partySize} guests · Table {r.tableNumber}
          </Text>
          {r.status === 'Pending' ? (
            <View style={[styles.row, { gap: spacing.sm }]}>
              <AppButton small variant="success" title="Accept" onPress={() => setStatus(r.id, 'Accepted')} />
              <AppButton small variant="outline" title="Decline" onPress={() => setStatus(r.id, 'Declined')} />
            </View>
          ) : null}
        </Card>
      )}
    />
  );
}

// -------------------------------------------------------------- Menu tab
const NEW_ITEM = { name: '', price: '', description: '', category: 'mains', image: '🍛' };
function validateNewItem(v) {
  const e = {};
  if (v.name.trim().length < 3) e.name = 'Name must be at least 3 characters.';
  if (!(Number(v.price) > 0)) e.price = 'Enter a price greater than 0.';
  return e;
}

function MenuTab({ menuItems, reload, refreshing, onRefresh }) {
  const { colors } = useTheme();
  const { values, errors, handleChange, handleSubmit, reset } = useForm(NEW_ITEM, validateNewItem);
  const [priceDrafts, setPriceDrafts] = useState({}); // { [id]: 'text' }

  const savePrice = (item) => {
    const draft = priceDrafts[item.id];
    if (draft === undefined) return;
    if (!(Number(draft) > 0)) {
      Alert.alert('Invalid price', 'Price must be a number greater than 0.');
      return;
    }
    setPriceDrafts(({ [item.id]: _saved, ...rest }) => rest);
    // PUT /api/menu/:id  (manager token required)
    runAndReload(() => api(`/menu/${item.id}`, { method: 'PUT', body: { price: Number(draft) } }), reload);
  };

  // PUT /api/menu/:id  { isAvailable }
  const toggleAvailability = (item) =>
    runAndReload(() => api(`/menu/${item.id}`, { method: 'PUT', body: { isAvailable: !item.isAvailable } }), reload);

  // POST /api/menu
  const addItem = async (v) => {
    try {
      await api('/menu', {
        method: 'POST',
        body: { name: v.name, price: Number(v.price), description: v.description, category: v.category, image: v.image },
      });
      reset();
      Alert.alert('Added', `${v.name} is now on the menu for every customer.`);
    } catch (err) {
      Alert.alert('Not added', err.message);
    } finally {
      reload({ silent: true });
    }
  };

  const header = (
    <Card style={{ marginBottom: spacing.lg }}>
      <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16, marginBottom: spacing.sm }}>Add a new item</Text>
      <Field label="Name" value={values.name} onChangeText={handleChange('name')} error={errors.name} placeholder="Chicken Tikka" />
      <View style={[styles.row, { gap: spacing.sm }]}>
        <Field style={{ flex: 1 }} label="Price (Rs)" value={values.price} onChangeText={handleChange('price')} error={errors.price} keyboardType="numeric" placeholder="950" />
        <Field style={{ width: 90 }} label="Emoji" value={values.image} onChangeText={handleChange('image')} maxLength={4} />
      </View>
      <Field label="Description" value={values.description} onChangeText={handleChange('description')} placeholder="Short description" />
      <View style={[styles.row, { flexWrap: 'wrap', marginBottom: spacing.md }]}>
        {categories.filter((c) => c.id !== 'all').map((c) => (
          <Chip key={c.id} label={c.name} selected={values.category === c.id} onPress={() => handleChange('category')(c.id)} style={{ marginBottom: 6 }} />
        ))}
      </View>
      <AppButton
        title="Add to menu"
        onPress={() =>
          handleSubmit(addItem)
        }
      />
    </Card>
  );

  return (
    <FlatList
      data={menuItems}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.pad}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <>
          {header}
          <SectionTitle style={{ marginTop: 0 }}>Current menu ({menuItems.length})</SectionTitle>
        </>
      }
      renderItem={({ item }) => {
        const draft = priceDrafts[item.id];
        return (
          <View style={[styles.menuRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 26 }}>{item.image}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: item.isAvailable ? colors.text : colors.textMuted, fontWeight: '800' }} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.row, { gap: 6, marginTop: 4 }]}>
                <Text style={{ color: colors.textMuted }}>Rs</Text>
                <TextInput
                  value={draft !== undefined ? draft : String(item.price)}
                  onChangeText={(t) => setPriceDrafts((p) => ({ ...p, [item.id]: t }))}
                  keyboardType="numeric"
                  style={[styles.priceInput, { color: colors.text, borderColor: colors.border }]}
                />
                {draft !== undefined ? (
                  <Pressable onPress={() => savePrice(item)}>
                    <Text style={{ color: colors.primary, fontWeight: '800' }}>Save</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Switch
                value={item.isAvailable}
                onValueChange={() => toggleAvailability(item)}
                trackColor={{ true: colors.success, false: colors.border }}
              />
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>{item.isAvailable ? 'Available' : 'Hidden'}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

// ------------------------------------------------------------ Dashboard
export default function ManagerDashboardScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState('orders');
  const [refreshing, setRefreshing] = useState(false);

  // A2: the dashboard reads everything from the server (manager token).
  const ordersApi = useApi('/orders', { initialData: [] }); // GET /api/orders
  const reservationsApi = useApi('/reservations', { initialData: [] }); // GET /api/reservations
  const menuApi = useApi('/menu', { initialData: [] }); // GET /api/menu
  const orders = ordersApi.data || [];
  const reservations = reservationsApi.data || [];
  const menuItems = menuApi.data || [];
  const { refetch: reloadOrders } = ordersApi;
  const { refetch: reloadReservations } = reservationsApi;
  const { refetch: reloadMenu } = menuApi;

  const reloadAll = React.useCallback(() => {
    reloadOrders({ silent: true });
    reloadReservations({ silent: true });
    reloadMenu({ silent: true });
  }, [reloadOrders, reloadReservations, reloadMenu]);
  useRefetchOnFocus(reloadAll);

  // New customer orders and bookings show up on their own every 10 s.
  useEffect(() => {
    const id = setInterval(() => {
      reloadOrders({ silent: true });
      reloadReservations({ silent: true });
    }, 10000);
    return () => clearInterval(id);
  }, [reloadOrders, reloadReservations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([reloadOrders({ silent: true }), reloadReservations({ silent: true }), reloadMenu({ silent: true })]);
    setRefreshing(false);
  };

  const loadError = ordersApi.error || reservationsApi.error || menuApi.error;

  const activeOrders = orders.filter((o) => o.status !== 'Served' && o.status !== CANCELLED).length;
  const pendingRes = reservations.filter((r) => r.status === 'Pending').length;
  const counts = { orders: activeOrders, reservations: pendingRes, menu: null };

  // Today's takings from orders that were not cancelled (derived, not stored).
  const todayRevenue = useMemo(() => {
    const today = new Date().toDateString();
    return orders
      .filter((o) => o.status !== CANCELLED && new Date(o.createdAt).toDateString() === today)
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const stats = [
    { label: 'Active orders', value: String(activeOrders), icon: 'flame-outline' },
    { label: 'New bookings', value: String(pendingRes), icon: 'calendar-outline' },
    { label: "Today's sales", value: formatPrice(todayRevenue), icon: 'cash-outline' },
  ];

  return (
    <Screen>
      <View style={styles.stats}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.stat, { backgroundColor: colors.hero }]}>
            <Ionicons name={s.icon} size={18} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.heroText }]} numberOfLines={1} adjustsFontSizeToFit>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.heroText }]} numberOfLines={1}>{s.label}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.tabs, { backgroundColor: colors.surfaceAlt }]}>
        {TABS.map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, tab === t.key && { backgroundColor: colors.primary }]}>
            <Text style={{ color: tab === t.key ? colors.primaryText : colors.text, fontWeight: '800', fontSize: 12 }} numberOfLines={1}>
              {t.label}{counts[t.key] ? ` (${counts[t.key]})` : ''}
            </Text>
          </Pressable>
        ))}
      </View>
      {loadError ? (
        <Text style={{ color: colors.danger, marginHorizontal: spacing.lg, marginTop: spacing.sm }}>{loadError}</Text>
      ) : null}
      {tab === 'orders' ? (
        <OrdersTab orders={orders} reload={reloadOrders} refreshing={refreshing} onRefresh={onRefresh} />
      ) : tab === 'reservations' ? (
        <ReservationsTab reservations={reservations} reload={reloadReservations} refreshing={refreshing} onRefresh={onRefresh} />
      ) : (
        <MenuTab menuItems={menuItems} reload={reloadMenu} refreshing={refreshing} onRefresh={onRefresh} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  stats: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  stat: { flex: 1, borderRadius: radius.lg, padding: spacing.md, gap: 2 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 11, opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  tabs: { flexDirection: 'row', margin: spacing.lg, marginBottom: 0, padding: 4, borderRadius: radius.md },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderRadius: radius.md, marginBottom: spacing.sm },
  priceInput: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, minWidth: 70 },
});
