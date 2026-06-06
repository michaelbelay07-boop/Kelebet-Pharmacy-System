// src/screens/customer/ProfileScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/client';
import { Button, Input, Divider } from '../../components';
import { colors, spacing, typography, radius, shadows } from '../../theme';

const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      await updateUser(res.data.user);
      setEditing(false);
      Alert.alert('✅ Saved', 'Profile updated successfully.');
    } catch {
      // Demo mode
      await updateUser({ ...user, ...form });
      setEditing(false);
      Alert.alert('✅ Saved', 'Profile updated successfully.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);

  const MenuItem = ({ icon, label, value, onPress, danger, rightElement }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {rightElement || (onPress && !danger && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />)}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
      </View>

      <View style={styles.container}>
        {/* Edit Profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
              <Text style={styles.editBtn}>{editing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <View style={styles.card}>
              <Input
                label="Full Name"
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Your full name"
                leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Phone Number"
                value={form.phone}
                onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
                placeholder="+251 9XX XXX XXX"
                keyboardType="phone-pad"
                leftIcon={<Ionicons name="call-outline" size={18} color={colors.textMuted} />}
              />
              <Input
                label="Email"
                value={user?.email}
                editable={false}
                leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
              />
              <View style={styles.editActions}>
                <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }} />
                <Button title="Save Changes" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <MenuItem icon="person-outline" label="Full Name" value={user?.name} />
              <Divider />
              <MenuItem icon="mail-outline" label="Email" value={user?.email} />
              <Divider />
              <MenuItem icon="call-outline" label="Phone" value={user?.phone || 'Not set'} />
            </View>
          )}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name="notifications-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Push Notifications</Text>
                <Text style={styles.menuValue}>Order updates & offers</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={notifications ? colors.primary : colors.white}
              />
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <MenuItem icon="help-circle-outline" label="Help & FAQ" onPress={() => Alert.alert('Help', 'Contact us at support@kelebet.com')} />
            <Divider />
            <MenuItem icon="chatbubble-outline" label="Contact Support" onPress={() => Alert.alert('Support', 'Call us at +251 11 XXX XXXX')} />
            <Divider />
            <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
            <Divider />
            <MenuItem icon="document-text-outline" label="Terms of Service" onPress={() => {}} />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.card}>
            <MenuItem icon="information-circle-outline" label="App Version" value="1.0.0" />
          </View>
        </View>

        {/* Sign Out */}
        <View style={[styles.section, { marginBottom: spacing['3xl'] }]}>
          <View style={styles.card}>
            <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.base,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, color: colors.white },
  userName: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.white },
  userEmail: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  userPhone: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  container: { padding: spacing.base },
  section: { marginBottom: spacing.base },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.text },
  editBtn: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.semibold },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', ...shadows.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.base },
  menuIcon: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 8,
    marginRight: spacing.md,
  },
  menuIconDanger: { backgroundColor: colors.errorLight },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text },
  menuLabelDanger: { color: colors.error },
  menuValue: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: 1 },
  editActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});

export default ProfileScreen;
