import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { categories, fetchMenu } from '../data/menu';

const COLORS = { primary: '#D9480F', text: '#1F1A17', muted: '#6F655E', border: '#E7DBD0', bg: '#FFF8F2', white: '#FFFFFF', chip: '#F1E3D6', accent: '#F59F00', disabled: '#BDB5AE' };

function MenuCard({ item }) {
  const disabled = !item.isAvailable;
  return (
    <View style={[styles.card, disabled && { opacity: 0.5 }]}>
      <Text style={styles.image}>{item.image}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        {item.isSpecial ? <Text style={styles.badge}>⭐ Daily Special</Text> : null}
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>Rs {item.price}</Text>
          <Pressable disabled={disabled} style={[styles.add, disabled && { backgroundColor: COLORS.disabled }]}>
            <Text style={{ color: COLORS.white, fontWeight: '700' }}>{disabled ? 'Unavailable' : 'Add'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function MenuScreen({ navigation }) {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredItems, setFilteredItems] = useState([]);
  const [reloadKey, setReloadKey] = useState(0); // bumping it re-runs the load (Retry)
  const requestRef = useRef(null);

  // Load the menu when the screen mounts (and on Retry).
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const request = fetchMenu();
    requestRef.current = request;
    request.promise
      .then((data) => setMenuItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
    // Cleanup: clear the timer so no state update happens after unmount.
    return () => request.cancel();
  }, [reloadKey]);

  // Re-filter whenever the category or the data changes.
  useEffect(() => {
    setFilteredItems(
      selectedCategory === 'all' ? menuItems : menuItems.filter((i) => i.category === selectedCategory)
    );
  }, [selectedCategory, menuItems]);

  // Header shows how many items are currently displayed.
  useEffect(() => {
    navigation.setOptions({ title: `Menu (${filteredItems.length})` });
  }, [navigation, filteredItems.length]);

  const onRefresh = () => {
    setRefreshing(true);
    const request = fetchMenu();
    requestRef.current = request;
    request.promise
      .then((data) => setMenuItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setRefreshing(false));
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.muted, marginTop: 12 }}>Loading today’s menu…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 40 }}>📡</Text>
        <Text style={{ color: COLORS.text, marginVertical: 8, textAlign: 'center' }}>{error}</Text>
        <Pressable onPress={() => setReloadKey((k) => k + 1)} style={styles.retry}>
          <Text style={{ color: COLORS.white, fontWeight: '700' }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ padding: 12 }}>
        {categories.map((c) => (
          <Pressable key={c.id} onPress={() => setSelectedCategory(c.id)} style={[styles.chip, selectedCategory === c.id && { backgroundColor: COLORS.primary }]}>
            <Text style={{ fontWeight: '600', color: selectedCategory === c.id ? COLORS.white : COLORS.text }}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORS.bg },
  retry: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  chip: { backgroundColor: COLORS.chip, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginRight: 8 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, padding: 12, marginBottom: 12 },
  image: { fontSize: 40, width: 60, textAlign: 'center' },
  name: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  badge: { alignSelf: 'flex-start', backgroundColor: COLORS.accent, fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginVertical: 2, overflow: 'hidden' },
  desc: { color: COLORS.muted, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  price: { fontWeight: '800', color: COLORS.text },
  add: { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
});
