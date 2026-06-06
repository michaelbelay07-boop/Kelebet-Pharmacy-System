// src/screens/customer/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, TextInput, RefreshControl, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { productsAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/ProductCard';
import { SectionHeader, LoadingScreen } from '../../components';
import { colors, spacing, typography, radius, shadows } from '../../theme';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '💊' },
  { id: 'vitamins', label: 'Vitamins', icon: '🌿' },
  { id: 'pain-relief', label: 'Pain Relief', icon: '🩹' },
  { id: 'antibiotics', label: 'Antibiotics', icon: '🔬' },
  { id: 'skincare', label: 'Skin Care', icon: '✨' },
  { id: 'baby', label: 'Baby', icon: '👶' },
  { id: 'devices', label: 'Devices', icon: '🩺' },
];

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [prodRes, featRes] = await Promise.all([
        productsAPI.getAll(),
        productsAPI.getFeatured(),
      ]);
      setProducts(prodRes.data.products || []);
      setFeatured(featRes.data.products || []);
    } catch (e) {
      // Use demo data if API not ready
      setProducts(DEMO_PRODUCTS);
      setFeatured(DEMO_PRODUCTS.slice(0, 4));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  if (loading) return <LoadingScreen message="Loading products..." />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
            <Text style={styles.bannerTitle}>What do you need{'\n'}today?</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
            <Ionicons name="cart-outline" size={24} color={colors.white} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search medicines, vitamins..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Prescription Banner */}
        <TouchableOpacity
          style={styles.rxBanner}
          onPress={() => navigation.navigate('PrescriptionsTab')}
          activeOpacity={0.9}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.rxTitle}>Upload Prescription</Text>
            <Text style={styles.rxSub}>Get your prescribed medicines delivered fast</Text>
          </View>
          <View style={styles.rxIcon}>
            <Ionicons name="document-text" size={28} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader title="Categories" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.base }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: spacing.base, gap: spacing.sm }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, selectedCategory === cat.id && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Products */}
        {featured.length > 0 && !search && selectedCategory === 'all' && (
          <View style={styles.section}>
            <SectionHeader title="Featured" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.base }}>
              <View style={{ flexDirection: 'row', paddingHorizontal: spacing.base }}>
                {featured.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onPress={() => navigation.navigate('ProductDetail', { product })}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* All Products */}
        <View style={[styles.section, { paddingBottom: spacing['3xl'] }]}>
          <SectionHeader title={search ? `Results for "${search}"` : 'All Products'} />
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filtered.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onPress={() => navigation.navigate('ProductDetail', { product })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Demo data for when API is not connected
const DEMO_PRODUCTS = [
  { _id: '1', name: 'Vitamin C 1000mg', category: 'vitamins', price: 85, image: null, description: 'Immune support', requiresPrescription: false },
  { _id: '2', name: 'Paracetamol 500mg', category: 'pain-relief', price: 25, image: null, description: 'Pain & fever', requiresPrescription: false },
  { _id: '3', name: 'Amoxicillin 500mg', category: 'antibiotics', price: 120, image: null, description: 'Antibiotic', requiresPrescription: true },
  { _id: '4', name: 'Zinc Supplement', category: 'vitamins', price: 65, image: null, description: 'Daily zinc', requiresPrescription: false },
  { _id: '5', name: 'Ibuprofen 400mg', category: 'pain-relief', price: 35, image: null, description: 'Anti-inflammatory', requiresPrescription: false },
  { _id: '6', name: 'Blood Pressure Monitor', category: 'devices', price: 850, image: null, description: 'Digital BP monitor', requiresPrescription: false },
];

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary,
    padding: spacing['2xl'],
    paddingTop: spacing['3xl'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  bannerContent: { flex: 1 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: typography.fontSize.sm, marginBottom: 4 },
  bannerTitle: {
    color: colors.white,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    lineHeight: 32,
  },
  cartBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    padding: 10,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.secondary,
    borderRadius: radius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 10, fontWeight: typography.fontWeight.bold, color: colors.text },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.base,
    marginTop: -20,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    ...shadows.md,
  },
  searchInput: { flex: 1, fontSize: typography.fontSize.base, color: colors.text },
  rxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    margin: spacing.base,
    marginTop: spacing.lg,
    padding: spacing.base,
  },
  rxTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.primary },
  rxSub: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  rxIcon: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    padding: 10,
    ...shadows.sm,
  },
  section: { paddingHorizontal: spacing.base, paddingTop: spacing.lg },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryIcon: { fontSize: 14 },
  categoryLabel: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: typography.fontWeight.medium },
  categoryLabelActive: { color: colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  empty: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyIcon: { fontSize: 48, marginBottom: spacing.base },
  emptyText: { color: colors.textMuted, fontSize: typography.fontSize.base },
});

export default HomeScreen;
