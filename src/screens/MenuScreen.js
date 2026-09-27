import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categories, fetchMenu } from '../data/menu';

const COLORS = { primary: '#D9480F', text: '#1F1A17', muted: '#6F655E', border: '#E7DBD0', bg: '#FFF8F2', white: '#FFFFFF', chip: '#F1E3D6', accent: '#F59F00', disabled: '#BDB5AE' };

const SEARCH_DELAY = 400;
const BACK_TO_TOP_OFFSET = 300;
const MAX_RECENT = 5;

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

  // ---- Q5: search -----------------------------------------------------------
  const [query, setQuery] = useState('');          // what the user is typing
  const [searchText, setSearchText] = useState(''); // applied after the debounce
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);  // TextInput element
  const debounceRef = useRef(null);     // timeout id, must survive re-renders
  const previousQueryRef = useRef('');  // avoids duplicate consecutive searches

  // ---- Q5: scrolling --------------------------------------------------------
  const listRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // ---- Q5: render counter ---------------------------------------------------
  // A ref survives re-renders but changing ref.current does NOT schedule a
  // re-render (React does not track refs). Changing state DOES, because
  // setState tells React the UI may be out of date. That is why a ref is the
  // right tool for counting renders: using state here would loop forever.
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Manual debounce: every keystroke clears the pending timeout and starts a
  // new one; the search is applied after 400 ms without typing.
  const onChangeQuery = (text) => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchText(text);
      const term = text.trim();
      if (term && term.toLowerCase() !== previousQueryRef.current.toLowerCase()) {
        previousQueryRef.current = term;
        setRecentSearches((prev) => [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT));
      }
    }, SEARCH_DELAY);
  };

  // Clear the pending debounce timer when the screen unmounts.
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const clearSearch = () => {
    clearTimeout(debounceRef.current);
    setQuery('');
    setSearchText('');
    searchInputRef.current?.focus(); // keep focus
  };

  const onScroll = (e) => {
    const shouldShow = e.nativeEvent.contentOffset.y > BACK_TO_TOP_OFFSET;
    if (shouldShow !== showBackToTop) setShowBackToTop(shouldShow);
  };

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

  // Re-filter whenever the category, the search text or the data changes.
  useEffect(() => {
    const term = searchText.trim().toLowerCase();
    setFilteredItems(
      menuItems.filter(
        (i) =>
          (selectedCategory === 'all' || i.category === selectedCategory) &&
          (!term || i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term))
      )
    );
  }, [selectedCategory, searchText, menuItems]);

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
      <View style={styles.searchBar}>
        <Pressable onPress={() => searchInputRef.current?.focus()} hitSlop={8} accessibilityLabel="Focus search">
          <Ionicons name="search" size={20} color={COLORS.muted} />
        </Pressable>
        <TextInput
          ref={searchInputRef}
          value={query}
          onChangeText={onChangeQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search dishes, e.g. karahi"
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <Pressable onPress={clearSearch} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={20} color={COLORS.muted} />
          </Pressable>
        ) : null}
      </View>
      {isSearchFocused && query.length === 0 && recentSearches.length > 0 ? (
        <View style={styles.suggestions}>
          <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}>Recent searches</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {recentSearches.map((t) => (
              <Pressable key={t} onPress={() => onChangeQuery(t)} style={[styles.chip, { marginBottom: 6 }]}>
                <Text>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ padding: 12 }}>
        {categories.map((c) => (
          <Pressable key={c.id} onPress={() => setSelectedCategory(c.id)} style={[styles.chip, selectedCategory === c.id && { backgroundColor: COLORS.primary }]}>
            <Text style={{ fontWeight: '600', color: selectedCategory === c.id ? COLORS.white : COLORS.text }}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.debug}>renders: {renderCount.current}</Text>
      <FlatList
        ref={listRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ color: COLORS.text, fontWeight: '700' }}>No dishes found</Text>
            <Text style={{ color: COLORS.muted, textAlign: 'center' }}>Nothing matches “{searchText}”. Try another word or category.</Text>
          </View>
        }
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      {showBackToTop ? (
        <Pressable onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} style={styles.fab} accessibilityLabel="Back to top">
          <Ionicons name="arrow-up" size={18} color={COLORS.white} />
          <Text style={{ color: COLORS.white, fontWeight: '700' }}>Top</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: COLORS.bg },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 999, backgroundColor: COLORS.white },
  searchInput: { flex: 1, minHeight: 44, color: COLORS.text },
  suggestions: { marginHorizontal: 16, marginTop: 8, padding: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.white },
  debug: { alignSelf: 'flex-end', marginRight: 16, fontSize: 11, color: COLORS.muted },
  fab: { position: 'absolute', right: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, elevation: 4 },
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
