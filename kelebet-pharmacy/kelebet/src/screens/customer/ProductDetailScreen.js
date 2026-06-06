// src/screens/customer/ProductDetailScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { Button, Badge } from '../../components';
import { colors, spacing, typography, radius, shadows } from '../../theme';

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);

  const inCart = items.find((i) => i.productId === product._id);

  const handleAddToCart = () => {
    if (product.requiresPrescription) {
      Alert.alert(
        'Prescription Required',
        'This medicine requires a valid prescription. Please upload your prescription in the Rx tab.',
        [
          { text: 'Upload Rx', onPress: () => navigation.navigate('PrescriptionsTab') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    addItem(product, quantity);
    Alert.alert('Added to Cart', `${product.name} added successfully!`, [
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      { text: 'Continue', style: 'cancel' },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image || 'https://via.placeholder.com/400x280' }}
            style={styles.image}
            resizeMode="cover"
          />
          {product.requiresPrescription && (
            <View style={styles.rxBadge}>
              <Ionicons name="document-text" size={14} color={colors.white} />
              <Text style={styles.rxText}>Prescription Required</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Badge label={product.category || 'Medicine'} color={colors.surfaceAlt} textColor={colors.primary} />
            {product.inStock !== false && (
              <Badge label="In Stock" color={colors.successLight} textColor={colors.success} />
            )}
          </View>

          <Text style={styles.name}>{product.name}</Text>

          {product.manufacturer && (
            <Text style={styles.manufacturer}>By {product.manufacturer}</Text>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>ETB {product.price?.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>ETB {product.originalPrice?.toFixed(2)}</Text>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Dosage */}
          {product.dosage && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dosage</Text>
              <Text style={styles.description}>{product.dosage}</Text>
            </View>
          )}

          {/* Quantity selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.qBtn}
              >
                <Ionicons name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={styles.qBtn}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>ETB {((product.price || 0) * quantity).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <Button
          title={inCart ? 'Update Cart' : 'Add to Cart'}
          onPress={handleAddToCart}
          size="lg"
          style={{ flex: 1 }}
          icon={<Ionicons name="cart-outline" size={20} color={colors.white} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: { position: 'relative', backgroundColor: colors.white },
  image: { width: '100%', height: 260 },
  rxBadge: {
    position: 'absolute',
    bottom: spacing.base,
    left: spacing.base,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 4,
  },
  rxText: { color: colors.white, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  content: { padding: spacing.xl },
  topRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    marginBottom: 4,
  },
  manufacturer: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  price: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.primary },
  originalPrice: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: { fontSize: typography.fontSize.base, color: colors.textSecondary, lineHeight: 22 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  qBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  quantity: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, minWidth: 30, textAlign: 'center' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  totalLabel: { fontSize: typography.fontSize.base, color: colors.textSecondary },
  totalValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.primary },
  footer: {
    padding: spacing.base,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

export default ProductDetailScreen;
