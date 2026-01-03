import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Card, Button } from '../../components/common';
import { useAuthStore } from '../../store/authStore';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Chiqish',
      'Hisobingizdan chiqmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Chiqish',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Profilni tahrirlash',
      subtitle: "Shaxsiy ma'lumotlarni o'zgartirish",
      onPress: () => Alert.alert("Ma'lumot", "Tez orada qo'shiladi"),
    },
    {
      icon: 'lock-closed-outline',
      title: "Parolni o'zgartirish",
      subtitle: 'Xavfsizlik sozlamalari',
      onPress: () => Alert.alert("Ma'lumot", "Tez orada qo'shiladi"),
    },
    {
      icon: 'card-outline',
      title: "To'lov usullari",
      subtitle: "Karta va to'lov ma'lumotlari",
      onPress: () => Alert.alert("Ma'lumot", "Tez orada qo'shiladi"),
    },
    {
      icon: 'help-circle-outline',
      title: 'Yordam',
      subtitle: "Ko'p so'raladigan savollar",
      onPress: () => Alert.alert("Ma'lumot", "Tez orada qo'shiladi"),
    },
    {
      icon: 'information-circle-outline',
      title: 'Ilova haqida',
      subtitle: 'Versiya 1.0.0',
      onPress: () => Alert.alert('InFast AI', 'Versiya 1.0.0\n\n© 2024 InFast AI'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {/* Profile Card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                {user?.lastName?.charAt(0)?.toUpperCase() || ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>
            {user?.firstName || ''} {user?.lastName || ''}
          </Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Pro</Text>
              <Text style={styles.statLabel}>Tarif</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>30</Text>
              <Text style={styles.statLabel}>Kun</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐</Text>
              <Text style={styles.statLabel}>Premium</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sozlamalar</Text>
          
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.primaryBg }]}>
                  <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Bildirishnomalar</Text>
                  <Text style={styles.settingSubtitle}>Push xabarnomalar</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.gray400}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="moon-outline" size={20} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Tungi rejim</Text>
                  <Text style={styles.settingSubtitle}>Qorong'i tema</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
                thumbColor={darkMode ? COLORS.primary : COLORS.gray400}
              />
            </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Umumiy</Text>
          
          <Card style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: COLORS.gray100 }]}>
                      <Ionicons name={item.icon} size={20} color={COLORS.gray600} />
                    </View>
                    <View>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
                </TouchableOpacity>
                {index < menuItems.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Chiqish"
            onPress={handleLogout}
            variant="outline"
            icon={<Ionicons name="log-out-outline" size={20} color={COLORS.error} />}
            textStyle={{ color: COLORS.error }}
            style={{ borderColor: COLORS.error }}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: SIZES.radius.xl,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  userName: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray500,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    padding: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  settingSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginHorizontal: 12,
  },
  menuCard: {
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  menuSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
});

export default ProfileScreen;
