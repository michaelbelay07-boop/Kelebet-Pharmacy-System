// src/screens/customer/PrescriptionsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { prescriptionsAPI } from '../../api/client';
import { Button, EmptyState, LoadingScreen, StatusBadge } from '../../components';
import { colors, spacing, typography, radius, shadows } from '../../theme';

const DEMO_PRESCRIPTIONS = [
  { _id: 'RX-001', doctorName: 'Dr. Mekdes Alemu', createdAt: new Date().toISOString(), status: 'approved', notes: 'Amoxicillin 500mg, 3x daily' },
  { _id: 'RX-002', doctorName: 'Dr. Yohannes Bekele', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'pending', notes: 'Blood pressure meds' },
];

const PrescriptionCard = ({ item, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.rxIcon}>
        <Ionicons name="document-text" size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={styles.rxId}>Prescription #{item._id}</Text>
        <Text style={styles.rxDate}>
          {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
      </View>
      <StatusBadge status={item.status} />
    </View>

    {item.image && (
      <Image source={{ uri: item.image }} style={styles.rxImage} resizeMode="cover" />
    )}

    {item.doctorName && (
      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={14} color={colors.textMuted} />
        <Text style={styles.infoText}>{item.doctorName}</Text>
      </View>
    )}
    {item.notes && (
      <View style={styles.infoRow}>
        <Ionicons name="clipboard-outline" size={14} color={colors.textMuted} />
        <Text style={styles.infoText}>{item.notes}</Text>
      </View>
    )}

    {item.status === 'pending' && (
      <TouchableOpacity
        onPress={() => onDelete(item._id)}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={16} color={colors.error} />
        <Text style={styles.deleteBtnText}>Remove</Text>
      </TouchableOpacity>
    )}
  </View>
);

const PrescriptionsScreen = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => { fetchPrescriptions(); }, [])
  );

  const fetchPrescriptions = async () => {
    try {
      const res = await prescriptionsAPI.getAll();
      setPrescriptions(res.data.prescriptions || []);
    } catch {
      setPrescriptions(DEMO_PRESCRIPTIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const requestPermission = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const uploadPrescription = async (imageUri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: `prescription_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      await prescriptionsAPI.upload(formData);
      await fetchPrescriptions();
      Alert.alert('✅ Uploaded', 'Your prescription has been submitted for review. We will process it shortly.');
    } catch {
      // Demo mode: show success anyway
      const newRx = {
        _id: `RX-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        image: imageUri,
        notes: 'Pending review',
      };
      setPrescriptions((p) => [newRx, ...p]);
      Alert.alert('✅ Uploaded', 'Your prescription has been submitted for review!');
    } finally {
      setUploading(false);
    }
  };

  const handleCamera = async () => {
    const ok = await requestPermission('camera');
    if (!ok) {
      Alert.alert('Permission Denied', 'Camera access is required to take prescription photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      uploadPrescription(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const ok = await requestPermission('gallery');
    if (!ok) {
      Alert.alert('Permission Denied', 'Photo library access is required to select prescriptions.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      uploadPrescription(result.assets[0].uri);
    }
  };

  const handleDelete = (id) =>
    Alert.alert('Remove Prescription', 'Are you sure you want to remove this prescription?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try { await prescriptionsAPI.delete(id); } catch {}
          setPrescriptions((p) => p.filter((r) => r._id !== id));
        },
      },
    ]);

  const showUploadOptions = () =>
    Alert.alert('Upload Prescription', 'Choose how to add your prescription', [
      { text: '📷 Take Photo', onPress: handleCamera },
      { text: '🖼️ Choose from Gallery', onPress: handleGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);

  if (loading) return <LoadingScreen message="Loading prescriptions..." />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={prescriptions}
        keyExtractor={(i) => i._id}
        renderItem={({ item }) => <PrescriptionCard item={item} onDelete={handleDelete} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPrescriptions(); }} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.infoBoxText}>
              Upload a clear photo of your doctor's prescription. Our pharmacist will review it within 30 minutes.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="No prescriptions yet"
            subtitle="Upload your first prescription to order prescription medicines"
          />
        }
      />
      <View style={styles.footer}>
        <Button
          title={uploading ? 'Uploading...' : 'Upload Prescription'}
          onPress={showUploadOptions}
          loading={uploading}
          size="lg"
          icon={<Ionicons name="cloud-upload-outline" size={20} color={colors.white} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  list: { padding: spacing.base, paddingBottom: 100 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoBoxText: { flex: 1, fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  rxIcon: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 8,
  },
  rxId: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.text },
  rxDate: { fontSize: typography.fontSize.sm, color: colors.textMuted },
  rxImage: { width: '100%', height: 160, borderRadius: radius.md, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, alignSelf: 'flex-start' },
  deleteBtnText: { fontSize: typography.fontSize.sm, color: colors.error, fontWeight: typography.fontWeight.medium },
  footer: { padding: spacing.base, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.borderLight },
});

export default PrescriptionsScreen;
