// src/components/ProductCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onPress, horizontal = false }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product);
  };

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.horizontal} onPress={onPress} activeOpacity={0.9}>
        <Image
          source={{ uri: product.image || 'https://via.placeholder.com/80' }}
          style={styles.hImage}
        />
        <View style={styles.hContent}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.description} numberOfLines={1}>{product.description}</Text>
          <View style={styles.hFooter}>
            <Text style={styles.price}>ETB {product.price?.toFixed(2)}</Text>
            <TouchableOpacity onPress={handleAddToCart} style={styles.addBtnSm}>
              <Ionicons name="add" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image || 'https://via.placeholder.com/160' }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.requiresPrescription && (
          <View style={styles.rxBadge}>
            <Text style={styles.rxText}>Rx</Text>
          </View>
        )}
        {product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>ETB {product.price?.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>ETB {product.originalPrice?.toFixed(2)}</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleAddToCart} style={styles.addBtn}>
            <Ionicons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    width: 165,
    marginRight: spacing.md,
    ...shadows.sm,
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 130 },
  content: { padding: spacing.md },
  category: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  description: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  hFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  originalPrice: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnSm: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rxBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rxText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  // Horizontal card
  horizontal: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  hImage: { width: 90, height: 90 },
  hContent: { flex: 1, padding: spacing.md, justifyContent: 'space-between' },
});

export default ProductCard;
