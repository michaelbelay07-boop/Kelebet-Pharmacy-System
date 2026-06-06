// src/screens/customer/CartScreen.js
import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { Button, Divider, EmptyState } from '../../components';
import { colors, spacing, typography, radius, shadows } from '../../theme';

const CartItem = ({ item, onUpdate, onRemove }) => (
  <View style={styles.item}>
    <Image
      source={{ uri: item.product?.image || 'https://via.placeholder.com/70' }}
      style={styles.itemImage}
    />
    <View style={styles.itemContent}>
      <Text style={styles.itemName} numberOfLines={2}>{item.product?.name}</Text>
      <Text style={styles.itemPrice}>ETB {item.product?.price?.toFixed(2)}</Text>
      <View style={styles.qRow}>
        <TouchableOpacity onPress={() => onUpdate(item._id, item.quantity - 1)} style={styles.qBtn}>
          <Ionicons name="remove" size={16} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => onUpdate(item._id, item.quantity + 1)} style={styles.qBtn}>
          <Ionicons name="add" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.itemRight}>
      <Text style={styles.subtotal}>ETB {((item.product?.price || 0) * item.quantity).toFixed(2)}</Text>
      <TouchableOpacity onPress={() => onRemove(item._id)} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  </View>
);

const CartScreen = ({ navigation }) => {
  const { items, totalPrice, updateItem, removeItem, clearCart } = useCart();

  const delivery = totalPrice > 0 ? 30 : 0;
  const total = totalPrice + delivery;

  const handleClear = () =>
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          subtitle="Add medicines and products to your cart to get started"
          action={
            <Button
              title="Start Shopping"
              onPress={() => navigation.goBack()}
              style={{ marginTop: spacing.lg }}
            />
          }
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i._id || i.productId}
        renderItem={({ item }) => (
          <CartItem item={item} onUpdate={updateItem} onRemove={removeItem} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.itemCount}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>ETB {totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>ETB {delivery.toFixed(2)}</Text>
            </View>
            <Divider />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>ETB {total.toFixed(2)}</Text>
            </View>
          </View>
        }
      />
      <View style={styles.footer}>
        <Button
          title={`Checkout · ETB ${total.toFixed(2)}`}
          onPress={() => navigation.navigate('Checkout', { total, items })}
          size="lg"
          icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.base, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.base },
  itemCount: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.text },
  clearText: { fontSize: typography.fontSize.sm, color: colors.error },
  item: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  itemImage: { width: 70, height: 70, borderRadius: radius.md },
  itemContent: { flex: 1, marginLeft: spacing.md },
  itemName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text },
  itemPrice: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: 2 },
  qRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  qBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qty: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.text },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: spacing.sm },
  subtotal: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary },
  removeBtn: { padding: 4 },
  summary: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  summaryTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: typography.fontSize.base, color: colors.textSecondary },
  summaryValue: { fontSize: typography.fontSize.base, color: colors.text, fontWeight: typography.fontWeight.medium },
  totalLabel: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.text },
  totalValue: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.primary },
  footer: { padding: spacing.base, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.borderLight },
});

export default CartScreen;
