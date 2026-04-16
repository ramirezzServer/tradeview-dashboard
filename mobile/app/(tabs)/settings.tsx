import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { COLORS } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { API_BASE_URL } from '../../src/services/api';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

// ─── Setting row components ───────────────────────────────────────────────────

interface SettingRowProps {
  icon:      IoniconsName;
  iconColor?: string;
  label:     string;
  value?:    string;
  onPress?:  () => void;
  showArrow?: boolean;
  danger?:   boolean;
}

function SettingRow({
  icon, iconColor = COLORS.primary, label, value, onPress, showArrow = true, danger = false,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />
        )}
      </View>
    </TouchableOpacity>
  );
}

interface ToggleRowProps {
  icon:      IoniconsName;
  iconColor?: string;
  label:     string;
  value:     boolean;
  onChange:  (v: boolean) => void;
}

function ToggleRow({ icon, iconColor = COLORS.primary, label, value, onChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={value ? COLORS.text : COLORS.textMuted}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ─── User avatar ──────────────────────────────────────────────────────────────

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={styles.avatarWrap}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();

  // Local preference state (UI-only for now — can be persisted via /api/settings)
  const [notifications,  setNotifications]  = useState(true);
  const [priceAlerts,    setPriceAlerts]     = useState(false);
  const [compactView,    setCompactView]     = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <UserAvatar name={user?.name ?? 'User'} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
          </View>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>PRO</Text>
          </View>
        </View>

        {/* Data section */}
        <SectionHeader title="DATA" />
        <View style={styles.section}>
          <SettingRow
            icon="server-outline"
            label="API Endpoint"
            value={API_BASE_URL.replace('http://', '').replace('/api', '')}
            showArrow={false}
          />
          <SettingRow
            icon="time-outline"
            iconColor={COLORS.bull}
            label="Quote Refresh Rate"
            value="15 seconds"
            showArrow={false}
          />
          <SettingRow
            icon="trending-up-outline"
            iconColor={COLORS.warning}
            label="Movers Refresh Rate"
            value="5 minutes"
            showArrow={false}
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={styles.section}>
          <ToggleRow
            icon="notifications-outline"
            label="Push Notifications"
            value={notifications}
            onChange={setNotifications}
          />
          <ToggleRow
            icon="alarm-outline"
            iconColor={COLORS.warning}
            label="Price Alerts"
            value={priceAlerts}
            onChange={setPriceAlerts}
          />
        </View>

        {/* Display */}
        <SectionHeader title="DISPLAY" />
        <View style={styles.section}>
          <ToggleRow
            icon="list-outline"
            label="Compact View"
            value={compactView}
            onChange={setCompactView}
          />
          <SettingRow
            icon="moon-outline"
            iconColor={COLORS.info}
            label="Theme"
            value="Dark"
            showArrow={false}
          />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={styles.section}>
          <SettingRow
            icon="information-circle-outline"
            iconColor={COLORS.textMuted}
            label="App Version"
            value="1.0.0"
            showArrow={false}
          />
          <SettingRow
            icon="code-slash-outline"
            iconColor={COLORS.textMuted}
            label="Built with"
            value="Expo + Laravel"
            showArrow={false}
          />
        </View>

        {/* Account actions */}
        <SectionHeader title="ACCOUNT" />
        <View style={styles.section}>
          <SettingRow
            icon="log-out-outline"
            iconColor={COLORS.bear}
            label="Sign Out"
            onPress={handleLogout}
            danger
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.background },
  screenHeader: { paddingHorizontal: 16, paddingVertical: 14 },
  screenTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },

  // ── Profile card ──
  profileCard: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   COLORS.card,
    borderRadius:      14,
    padding:           16,
    marginHorizontal:  16,
    marginBottom:      20,
    borderWidth:       1,
    borderColor:       COLORS.border,
    gap:               12,
  },
  avatarWrap: {},
  avatar: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: COLORS.primary + '25',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     COLORS.primary + '40',
  },
  avatarText:   { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  profileInfo:  { flex: 1 },
  profileName:  { fontSize: 16, fontWeight: '700', color: COLORS.text },
  profileEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  profileBadge: { backgroundColor: COLORS.primary + '20', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, borderWidth: 1, borderColor: COLORS.primary + '40' },
  profileBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryLight, letterSpacing: 1 },

  // ── Section ──
  sectionHeader: {
    fontSize:          11,
    fontWeight:        '700',
    color:             COLORS.textMuted,
    letterSpacing:     1,
    marginBottom:       8,
    marginTop:         4,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius:    14,
    marginHorizontal: 16,
    marginBottom:    16,
    borderWidth:     1,
    borderColor:     COLORS.border,
    overflow:        'hidden',
  },
  // ── Row ──
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   14,
    paddingHorizontal: 14,
    gap:               12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  rowIcon: {
    width:          36,
    height:         36,
    borderRadius:   10,
    alignItems:     'center',
    justifyContent: 'center',
  },
  rowLabel:      { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  rowLabelDanger: { color: COLORS.bear },
  rowRight:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue:      { fontSize: 13, color: COLORS.textMuted },
});
