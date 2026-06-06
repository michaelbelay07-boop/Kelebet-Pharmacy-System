// src/screens/customer/OrdersScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ordersAPI } from '../../api/client';
import { StatusBadge, EmptyState, LoadingScreen } from '../../components';
import { colors, spacing, typography, radius, shadows } from '../../theme';

const DEMO_ORDERS = [
  {
    _id: 'ORD-001', createdAt: new Date().toISOString(),
    status: 'delivered', totalAmount: 280, items: [{ product: { name: 'Vitamin C 1000mg' } }],
  },
  {
    _id: 'ORD-002', createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'processing', totalAmount: 155, items: [{ product: { name: 'Paracetamol 500mg' } }],
  },
  {
    _id: 'ORD-003', createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'pending', totalAmount: 420, items: [{ product: { name: 'Blood Pressure Monitor' } }],
  },
];

const OrderCard = ({ order, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.cardTop}>
      <View>
        <Text style={styles.orderId}>#{order._id}</Text>
        <Text style={styles.orderDate}>
          {new Date(order.createdAt).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </Text>
      </View>
      <StatusBadge status={order.status} />
    </View>
    <View style={styles.cardBottom}>
      <Text style={styles.itemNames} numberOfLines={1}>
        {order.items?.map((i) => i.product?.name || 'Item').join(', ')}
      </Text>
      <Text style={styles.amount}>ETB {order.totalAmount?.toFixed(2)}</Text>
    </View>
    <View style={styles.arrowRow}>
      <Text style={styles.viewDetails}>View Details</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.primary} />
    </View>
  </TouchableOpacity>
);

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => { fetchOrders(); }, [])
  );

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data.orders || []);
    } catch {
      setOrders(DEMO_ORDERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading orders..." />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o._id}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { order: item })} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title="No orders yet"
            subtitle="Your order history will appear here once you place your first order"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.base, paddingBottom: spacing['3xl'] },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  orderId: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.text },
  orderDate: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  itemNames: { flex: 1, fontSize: typography.fontSize.sm, color: colors.textSecondary, marginRight: spacing.sm },
  amount: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.primary },
  arrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  viewDetails: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.medium },
});

export default OrdersScreen;
