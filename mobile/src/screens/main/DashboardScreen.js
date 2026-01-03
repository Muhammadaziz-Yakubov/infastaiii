import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Card, Loading } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import taskService from '../../services/taskService';
import goalsService from '../../services/goalsService';
import financeService from '../../services/financeService';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, pending: 0 },
    goals: { total: 0, completed: 0, inProgress: 0 },
    finance: { income: 0, expense: 0, balance: 0 },
  });

  const loadData = async () => {
    try {
      const [tasksData, goalsData, financeData] = await Promise.all([
        taskService.getTasks().catch(() => ({ tasks: [] })),
        goalsService.getGoals().catch(() => ({ goals: [] })),
        financeService.getTransactions().catch(() => ({ transactions: [] })),
      ]);

      const tasks = tasksData.tasks || [];
      const goals = goalsData.goals || [];
      const transactions = financeData.transactions || [];

      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const completedGoals = goals.filter(g => g.status === 'completed').length;
      const inProgressGoals = goals.filter(g => g.status === 'in_progress').length;

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          pending: tasks.length - completedTasks,
        },
        goals: {
          total: goals.length,
          completed: completedGoals,
          inProgress: inProgressGoals,
        },
        finance: {
          income,
          expense,
          balance: income - expense,
        },
      });
    } catch (error) {
      console.log('Dashboard data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Xayrli tong';
    if (hour < 18) return 'Xayrli kun';
    return 'Xayrli kech';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const taskProgress = stats.tasks.total > 0 
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) 
    : 0;

  if (loading) {
    return <Loading text="Ma'lumotlar yuklanmoqda..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.firstName || 'Foydalanuvchi'}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.profileGradient}
            >
              <Text style={styles.profileInitial}>
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Tasks Card */}
          <TouchableOpacity 
            style={styles.statsCard}
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.statsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statsIconBox}>
                <Ionicons name="checkbox-outline" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.statsValue}>{stats.tasks.total}</Text>
              <Text style={styles.statsLabel}>Vazifalar</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${taskProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{taskProgress}% bajarildi</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Goals Card */}
          <TouchableOpacity 
            style={styles.statsCard}
            onPress={() => navigation.navigate('Goals')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.secondaryDark]}
              style={styles.statsGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statsIconBox}>
                <Ionicons name="trophy-outline" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.statsValue}>{stats.goals.total}</Text>
              <Text style={styles.statsLabel}>Maqsadlar</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statsSmall}>
                  {stats.goals.inProgress} jarayonda
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Finance Card */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Finance')}
        >
          <Card style={styles.financeCard}>
            <View style={styles.financeHeader}>
              <View style={styles.financeIconBox}>
                <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.financeTitle}>Moliyaviy holat</Text>
                <Text style={styles.financeBalance}>
                  {stats.finance.balance >= 0 ? '+' : ''}{formatNumber(stats.finance.balance)} UZS
                </Text>
              </View>
            </View>
            <View style={styles.financeStats}>
              <View style={styles.financeItem}>
                <View style={[styles.financeIndicator, { backgroundColor: COLORS.success }]} />
                <View>
                  <Text style={styles.financeItemLabel}>Daromad</Text>
                  <Text style={[styles.financeItemValue, { color: COLORS.success }]}>
                    +{formatNumber(stats.finance.income)}
                  </Text>
                </View>
              </View>
              <View style={styles.financeItem}>
                <View style={[styles.financeIndicator, { backgroundColor: COLORS.error }]} />
                <View>
                  <Text style={styles.financeItemLabel}>Xarajat</Text>
                  <Text style={[styles.financeItemValue, { color: COLORS.error }]}>
                    -{formatNumber(stats.finance.expense)}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Tezkor amallar</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Tasks')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryBg }]}>
                <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Vazifa</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Goals')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="flag-outline" size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionText}>Maqsad</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Finance')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.successBg }]}>
                <Ionicons name="cash-outline" size={28} color={COLORS.success} />
              </View>
              <Text style={styles.actionText}>Tranzaksiya</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.warningBg }]}>
                <Ionicons name="person-outline" size={28} color={COLORS.warning} />
              </View>
              <Text style={styles.actionText}>Profil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: SIZES.base,
    color: COLORS.gray500,
  },
  userName: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  profileButton: {
    ...SHADOWS.md,
  },
  profileGradient: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: SIZES.radius.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  statsGradient: {
    padding: 20,
    minHeight: 160,
  },
  statsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
  },
  statsLabel: {
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },
  progressText: {
    fontSize: SIZES.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
  statsRow: {
    marginTop: 12,
  },
  statsSmall: {
    fontSize: SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  financeCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  financeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  financeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  financeTitle: {
    fontSize: SIZES.md,
    color: COLORS.gray500,
  },
  financeBalance: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  financeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financeIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  financeItemLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray500,
  },
  financeItemValue: {
    fontSize: SIZES.base,
    fontWeight: '600',
  },
  quickActions: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    width: (width - 52) / 4,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: SIZES.sm,
    color: COLORS.gray600,
    fontWeight: '500',
  },
});

export default DashboardScreen;
