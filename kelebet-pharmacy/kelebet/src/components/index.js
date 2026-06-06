// src/components/index.js
import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Image,
} from 'react-native';
import { colors, spacing, radius, shadows, typography } from '../theme';

// ─── Button ──────────────────────────────────────────────────────────────────
export const Button = ({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, style, textStyle,
}) => {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  const bg = isOutline || isGhost ? 'transparent'
    : isDanger ? colors.error
    : colors.primary;

  const borderColor = isOutline ? colors.primary
    : isDanger ? colors.error
    : 'transparent';

  const txtColor = isOutline ? colors.primary
    : isGhost ? colors.textSecondary
    : isDanger ? colors.white
    : colors.white;

  const pad = size === 'sm' ? { paddingVertical: 8, paddingHorizontal: 16 }
    : size === 'lg' ? { paddingVertical: 16, paddingHorizontal: 28 }
    : { paddingVertical: 13, paddingHorizontal: 22 };

  const fontSize = size === 'sm' ? typography.fontSize.sm
    : size === 'lg' ? typography.fontSize.md
    : typography.fontSize.base;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor, borderWidth: isOutline ? 1.5 : 0 },
        pad,
        (disabled || loading) && { opacity: 0.55 },
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={[styles.btnText, { color: txtColor, fontSize }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Input ───────────────────────────────────────────────────────────────────
export const Input = ({
  label, value, onChangeText, placeholder, secureTextEntry,
  keyboardType, error, leftIcon, rightIcon, editable = true,
  multiline, numberOfLines, style, inputStyle,
}) => (
  <View style={[styles.inputWrapper, style]}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={[
      styles.inputContainer,
      error && { borderColor: colors.error },
      !editable && { backgroundColor: colors.surfaceAlt },
    ]}>
      {leftIcon && <View style={styles.inputIcon}>{leftIcon}</View>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[styles.input, leftIcon && { paddingLeft: 0 }, inputStyle]}
      />
      {rightIcon && <View style={styles.inputIcon}>{rightIcon}</View>}
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.card, style]} activeOpacity={0.9}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ label, color = colors.primary, textColor = colors.white, style }) => (
  <View style={[styles.badge, { backgroundColor: color }, style]}>
    <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
  </View>
);

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    pending: { bg: colors.warningLight, text: colors.warning, label: 'Pending' },
    confirmed: { bg: colors.successLight, text: colors.success, label: 'Confirmed' },
    processing: { bg: '#E8F4FF', text: '#1A6DB5', label: 'Processing' },
    shipped: { bg: '#F0E6FF', text: '#7B2FBE', label: 'Shipped' },
    delivered: { bg: colors.successLight, text: colors.success, label: 'Delivered' },
    cancelled: { bg: colors.errorLight, text: colors.error, label: 'Cancelled' },
  };
  const s = map[status?.toLowerCase()] || map.pending;
  return <Badge label={s.label} color={s.bg} textColor={s.text} />;
};

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, subtitle, action }) => (
  <View style={styles.emptyState}>
    {icon && <Text style={styles.emptyIcon}>{icon}</Text>}
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {action}
  </View>
);

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export const LoadingScreen = ({ message = 'Loading...' }) => (
  <View style={styles.loadingScreen}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// ─── SectionHeader ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, actionLabel, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onAction && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{actionLabel || 'See all'}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  inputWrapper: { marginBottom: spacing.md },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.base,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    paddingVertical: 12,
  },
  inputIcon: { marginRight: spacing.sm },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  emptyIcon: { fontSize: 56, marginBottom: spacing.base },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.base,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  sectionAction: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
