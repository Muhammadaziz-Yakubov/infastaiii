import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

const MoreScreen = ({ navigation }) => {
  const features = [
    {
      id: 'challenges',
      icon: 'flame-outline',
      title: 'Challenges',
      description: 'Kundalik va haftalik vazifalar',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      id: 'archive',
      icon: 'archive-outline',
      title: 'Arxiv',
      description: "Bajarilgan vazifalar va maqsadlar",
      color: '#6366F1',
      bgColor: '#E0E7FF',
    },
    {
      id: 'statistics',
      icon: 'stats-chart-outline',
      title: 'Statistika',
      description: "Batafsil tahlil va grafiklar",
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      id: 'calendar',
      icon: 'calendar-outline',
      title: 'Kalendar',
      description: 'Vazifalar va voqealar',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
  ];

  const quickLinks = [
    { icon: 'help-circle-outline', label: 'Yordam', onPress: () => {} },
    { icon: 'star-outline', label: 'Baholash', onPress: () => Linking.openURL('https://play.google.com') },
    { icon: 'share-social-outline', label: 'Ulashish', onPress: () => {} },
    { icon: 'bug-outline', label: 'Xatolik xabari', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ko'proq</Text>
          <Text style={styles.headerSubtitle}>Qo'shimcha imkoniyatlar</Text>
        </View>

        {/* Premium Banner */}
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            style={styles.premiumBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.premiumContent}>
              <View style={styles.premiumIconBox}>
                <Ionicons name="diamond-outline" size={28} color="#fff" />
              </View>
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>Premium ga o'ting</Text>
                <Text style={styles.premiumDescription}>
                  Barcha imkoniyatlardan foydalaning
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.bgColor }]}>
                <Ionicons name={feature.icon} size={28} color={feature.color} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinksSection}>
          <Text style={styles.sectionTitle}>Tezkor havolalar</Text>
          <View style={styles.quickLinksCard}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={link.label}
                style={[
                  styles.quickLinkItem,
                  index < quickLinks.length - 1 && styles.quickLinkBorder,
                ]}
                onPress={link.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.quickLinkLeft}>
                  <View style={styles.quickLinkIcon}>
                    <Ionicons name={link.icon} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.quickLinkLabel}>{link.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>Ijtimoiy tarmoqlar</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://t.me/infastai_bot')}
            >
              <Ionicons name="paper-plane" size={24} color="#0088CC" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://instagram.com')}
            >
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://youtube.com')}
            >
              <Ionicons name="logo-youtube" size={24} color="#FF0000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://github.com')}
            >
              <Ionicons name="logo-github" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>InFast AI</Text>
          <Text style={styles.appVersion}>Versiya 1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 InFast. Barcha huquqlar himoyalangan.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  premiumText: {},
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  premiumDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  featureCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  quickLinksSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
  },
  quickLinksCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  quickLinkBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickLinkLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  socialSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  appVersion: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MoreScreen;
