// src/screens/customer/OrderDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../../api/client';
import { StatusBadge, Divider, Button, LoadingScreen } from '../../components';
import { colors, spacing, typography, radius, shadows } from '../../theme';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const OrderDetailScreen = ({ route }) => {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS.indexOf(order.status?.toLowerCase());

  const handleCancel = () =>
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await ordersAPI.cancel(order._id);
            setOrder((o) => ({ ...o, status: 'cancelled' }));
          } catch {
            Alert.alert('Error', 'Could not cancel order. Please try again.');
          }
        },
      },
    ]);

  const canCancel = ['pending', 'confirmed'].includes(order.status?.toLowerCase());

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusTop}>
            <Text style={styles.orderId}>Order #{order._id}</Text>
            <StatusBadge status={order.status} />
          </View>
          <Text style={styles.orderDate}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        </View>

        {/* Progress Tracker */}
        {order.status !== 'cancelled' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Progress</Text>
            <View style={styles.tracker}>
              {STEPS.map((step, idx) => {
                const done = idx <= currentStep;
                const active = idx === currentStep;
                return (
                  <View key={step} style={styles.stepWrapper}>
                    <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]}>
                      {done && <Ionicons name="checkmark" size={12} color={colors.white} />}
                    </View>
                    <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step}</Text>
                    {idx < STEPS.length - 1 && (
                      <View style={[styles.stepLine, idx < currentStep && styles.stepLineDone]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {(order.items || []).map((item, idx) => (
            <View key={idx} style={[styles.itemRow, idx < order.items.length - 1 && { marginBottom: spacing.md }]}>
              <View style={styles.itemDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product?.name || 'Medicine'}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity} × ETB {item.price?.toFixed(2)}</Text>
              </View>
              <Text style={styles.itemSubtotal}>ETB {((item.quantity || 1) * (item.price || 0)).toFixed(2)}</Text>
            </View>
          ))}
          <Divider />
          <InfoRow label="Delivery Fee" value={`ETB ${(order.deliveryFee || 30).toFixed(2)}`} />
          <InfoRow label="Total" value={`ETB ${order.totalAmount?.toFixed(2)}`} />
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <View style={styles.addressBox}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={styles.addressText}>
                {[order.deliveryAddress.street, order.deliveryAddress.subCity, order.deliveryAddress.city]
                  .filter(Boolean).join(', ')}
              </Text>
            </View>
            {order.deliveryAddress.phone && (
              <Text style={styles.phone}>📞 {order.deliveryAddress.phone}</Text>
            )}
          </View>
        )}

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <InfoRow label="Method" value={order.paymentMethod || 'Cash on Delivery'} />
          <InfoRow label="Status" value={order.paymentStatus || 'Pending'} />
        </View>

        {canCancel && (
          <Button
            title="Cancel Order"
            onPress={handleCancel}
            variant="danger"
            style={styles.cancelBtn}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.base, paddingBottom: spacing['3xl'] },
  statusBanner: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.base,
  },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.white },
  orderDate: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  cardTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.text, marginBottom: spacing.md },
  tracker: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  stepWrapper: { alignItems: 'center', flex: 1, position: 'relative' },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotDone: { backgroundColor: colors.primary },
  stepDotActive: { backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.primaryLight },
  stepLabel: { fontSize: 9, color: colors.textMuted, textAlign: 'center', textTransform: 'capitalize' },
  stepLabelDone: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  stepLine: {
    position: 'absolute',
    top: 11, left: '60%', right: '-60%',
    height: 2, backgroundColor: colors.border,
    zIndex: -1,
  },
  stepLineDone: { backgroundColor: colors.primary },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  itemDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 5 },
  itemName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text },
  itemQty: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: 2 },
  itemSubtotal: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.primary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  infoLabel: { fontSize: typography.fontSize.base, color: colors.textSecondary },
  infoValue: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text },
  addressBox: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  addressText: { flex: 1, fontSize: typography.fontSize.base, color: colors.textSecondary, lineHeight: 22 },
  phone: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: spacing.sm },
  cancelBtn: { marginTop: spacing.sm },
});

export default OrderDetailScreen;
