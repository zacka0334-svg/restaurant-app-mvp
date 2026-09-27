import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { ADD_ITEM } from '../reducers/cartReducer';
import { categories, fetchMenu } from '../data/menu';
import useDebounce from '../hooks/useDebounce';
import MenuItemCard from '../components/MenuItemCard';
import { AppButton, Chip, EmptyState, Screen } from '../components/ui';
import { radius, spacing } from '../theme/colors';

const SORT_OPTIONS = [
  { key: 'default', label: 'Recommended' },
  { key: 'priceAsc', label: 'Price ↑' },
  { key: 'priceDesc', label: 'Price ↓' },
  { key: 'nameAsc', label: 'Name A–Z' },
];
const BACK_TO_TOP_OFFSET = 300;
const MAX_RECENT = 5;

export default function MenuScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { menuItems } = useMenu(); // shared with the Manager Dashboard (Q10)
  const { state: cart, dispatch } = useCart();

  // ---- Q4: loading / error / refresh state --------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const requestRef = useRef(null); // holds the cancel() of the running request

  // ---- Q4/Q8: filters --------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [favourites, setFavourites] = useState([]); // array of item ids

  // ---- Q5/Q9: search --------------------------------------------------------
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400); // Q9 replaces the manual ref debounce
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const previousQueryRef = useRef('');

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

  // Simulated fetch. The data itself now lives in MenuContext so that manager
  // edits appear here instantly; this request models the network round trip
  // (loading spinner, error + Retry, pull-to-refresh).
  const load = useCallback(
    (asRefresh = false) => {
      requestRef.current?.cancel();
      if (asRefresh) setRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const request = fetchMenu(menuItems);
      requestRef.current = request;
      request.promise
        .then(() => setError(null))
        .catch((err) => setError(err.message))
        .finally(() => {
          setIsLoading(false);
          setRefreshing(false);
        });
    },
    [menuItems]
  );

  // Q4: runs once on mount. The cleanup clears the timer so no state update
  // happens after the screen unmounts.
  useEffect(() => {
    load(false);
    return () => requestRef.current?.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Q5: remember the last five distinct searches. The previous query is kept
  // in a ref so the same term typed twice in a row is not added again.
  useEffect(() => {
    const term = debouncedQuery.trim();
    if (!term || term.toLowerCase() === previousQueryRef.current.toLowerCase()) return;
    previousQueryRef.current = term;
    setRecentSearches((prev) => [term, ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT));
  }, [debouncedQuery]);

  // Q8: one useMemo replaces the old filteredItems state + effect.
  // Derived data must not be stored in state: it can be recomputed from
  // menuItems, selectedCategory, debouncedQuery and sortOrder at any time, and
  // copying it into state means an extra render and a risk of the copy getting
  // out of sync with its sources.
  const visibleItems = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    const filtered = menuItems.filter(
      (item) =>
        (selectedCategory === 'all' || item.category === selectedCategory) &&
        (!term || item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term))
    );
    const sorted = [...filtered];
    if (sortOrder === 'priceAsc') sorted.sort((a, b) => a.price - b.price);
    if (sortOrder === 'priceDesc') sorted.sort((a, b) => b.price - a.price);
    if (sortOrder === 'nameAsc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [menuItems, selectedCategory, debouncedQuery, sortOrder]);

  // Q4: header title shows the number of items currently shown.
  useEffect(() => {
    navigation.setOptions({ title: isLoading ? 'Menu' : `Menu (${visibleItems.length})` });
  }, [navigation, visibleItems.length, isLoading]);

  const quantityById = useMemo(() => {
    const map = {};
    cart.items.forEach((i) => { map[i.id] = i.quantity; });
    return map;
  }, [cart.items]);

  // Q8: stable handler references so React.memo on MenuItemCard works.
  const handleAdd = useCallback((item) => dispatch({ type: ADD_ITEM, payload: item }), [dispatch]);
  const handleToggleFavourite = useCallback(
    (id) => setFavourites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])),
    []
  );

  const renderItem = useCallback(
    ({ item }) => (
      <MenuItemCard
        item={item}
        isFavourite={favourites.includes(item.id)}
        quantityInCart={quantityById[item.id] || 0}
        onAdd={handleAdd}
        onToggleFavourite={handleToggleFavourite}
      />
    ),
    [favourites, quantityById, handleAdd, handleToggleFavourite]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const clearSearch = () => {
    setQuery('');
    searchInputRef.current?.focus(); // keep focus after clearing
  };

  const onScroll = (e) => {
    const shouldShow = e.nativeEvent.contentOffset.y > BACK_TO_TOP_OFFSET;
    if (shouldShow !== showBackToTop) setShowBackToTop(shouldShow);
  };

  const scrollToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });

  // ---------------------------------------------------------------- render --
  if (isLoading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textMuted, marginTop: 12 }}>Loading today’s menu…</Text>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={styles.center}>
        <EmptyState emoji="📡" title="Something went wrong" message={error}>
          <AppButton title="Retry" onPress={() => load(false)} style={{ marginTop: 12, minWidth: 140 }} />
        </EmptyState>
      </Screen>
    );
  }

  const showSuggestions = isSearchFocused && query.length === 0 && recentSearches.length > 0;

  return (
    <Screen>
      {/* Greeting */}
      <View style={styles.greeting}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Assalam o Alaikum{user ? `, ${user.fullName.split(' ')[0]}` : ''} 👋</Text>
          <Text style={[styles.greetingTitle, { color: colors.text }]}>What are you craving today?</Text>
        </View>
        {/* Q5 debug label: how many times MenuScreen has rendered */}
        <View style={[styles.debug, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textMuted, fontSize: 10 }}>renders</Text>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '900' }}>{renderCount.current}</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable onPress={() => searchInputRef.current?.focus()} hitSlop={8} accessibilityLabel="Focus search">
          <Ionicons name="search" size={20} color={colors.textMuted} />
        </Pressable>
        <TextInput
          ref={searchInputRef}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search dishes, e.g. karahi"
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <Pressable onPress={clearSearch} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {showSuggestions ? (
        <View style={[styles.suggestions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6 }}>Recent searches</Text>
          <View style={styles.wrapRow}>
            {recentSearches.map((term) => (
              <Chip key={term} label={term} onPress={() => setQuery(term)} style={{ marginBottom: 6 }} />
            ))}
          </View>
        </View>
      ) : null}

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={{ flexGrow: 0 }}>
        {categories.map((c) => (
          <Chip key={c.id} label={c.name} selected={selectedCategory === c.id} onPress={() => setSelectedCategory(c.id)} />
        ))}
      </ScrollView>

      {/* Sort options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow} style={{ flexGrow: 0 }}>
        <Ionicons name="swap-vertical" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
        {SORT_OPTIONS.map((s) => (
          <Pressable key={s.key} onPress={() => setSortOrder(s.key)} style={{ marginRight: 14 }}>
            <Text style={{ color: sortOrder === s.key ? colors.primary : colors.textMuted, fontWeight: sortOrder === s.key ? '800' : '500' }}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        ref={listRef}
        data={visibleItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        ListEmptyComponent={
          <EmptyState
            emoji="🔍"
            title="No dishes found"
            message={debouncedQuery ? `Nothing on the menu matches “${debouncedQuery}”. Try another word or category.` : 'No items in this category yet.'}
          />
        }
      />

      {showBackToTop ? (
        <Pressable
          onPress={scrollToTop}
          style={[styles.fab, { backgroundColor: colors.primary }]}
          accessibilityLabel="Back to top"
        >
          <Ionicons name="arrow-up" size={18} color={colors.primaryText} />
          <Text style={{ color: colors.primaryText, fontWeight: '700' }}>Top</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  greeting: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  greetingTitle: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: spacing.lg, marginTop: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderRadius: radius.pill },
  searchInput: { flex: 1, minHeight: 44, fontSize: 15 },
  suggestions: { marginHorizontal: spacing.lg, marginTop: spacing.sm, padding: spacing.md, borderWidth: 1, borderRadius: radius.md },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  sortRow: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, alignItems: 'center' },
  debug: { alignItems: 'center', borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 8, paddingVertical: 4, marginLeft: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 96 },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.pill, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
});
