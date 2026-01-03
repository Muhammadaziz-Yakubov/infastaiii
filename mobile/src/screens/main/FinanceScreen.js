import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Card, Loading, EmptyState, Button, Input } from '../../components/common';
import financeService from '../../services/financeService';

const FinanceScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'other',
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadTransactions = async () => {
    try {
      const data = await financeService.getTransactions();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.log('Finance load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions();
  }, []);

  const handleDeleteTransaction = (transaction) => {
    Alert.alert(
      "O'chirish",
      `"${transaction.title}" tranzaksiyasini o'chirmoqchimisiz?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            try {
              await financeService.deleteTransaction(transaction._id);
              setTransactions(prev => prev.filter(t => t._id !== transaction._id));
            } catch (error) {
              Alert.alert('Xatolik', "Tranzaksiyani o'chirib bo'lmadi");
            }
          },
        },
      ]
    );
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.title.trim()) {
      Alert.alert('Xatolik', 'Tranzaksiya nomini kiriting');
      return;
    }
    if (!newTransaction.amount || isNaN(Number(newTransaction.amount))) {
      Alert.alert('Xatolik', "To'g'ri summani kiriting");
      return;
    }

    setSaving(true);
    try {
      const result = await financeService.createTransaction({
        title: newTransaction.title.trim(),
        amount: Number(newTransaction.amount),
        type: newTransaction.type,
        category: newTransaction.category,
      });
      if (result.transaction) {
        setTransactions(prev => [result.transaction, ...prev]);
      }
      setModalVisible(false);
      setNewTransaction({ title: '', amount: '', type: 'expense', category: 'other' });
    } catch (error) {
      Alert.alert('Xatolik', "Tranzaksiya qo'shib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const totals = {
    income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0),
    expense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0),
  };
  totals.balance = totals.income - totals.expense;

  const formatNumber = (num) => {
    if (!num) return '0';
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: 'fast-food-outline',
      transport: 'car-outline',
      shopping: 'cart-outline',
      entertainment: 'game-controller-outline',
      health: 'medical-outline',
      education: 'school-outline',
      salary: 'cash-outline',
      other: 'ellipsis-horizontal-outline',
    };
    return icons[category] || icons.other;
  };

  const renderTransaction = ({ item }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionContent}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: item.type === 'income' ? COLORS.successBg : COLORS.errorBg }
        ]}>
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={22}
            color={item.type === 'income' ? COLORS.success : COLORS.error}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.createdAt || item.date)}</Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? COLORS.success : COLORS.error }
          ]}>
            {item.type === 'income' ? '+' : '-'}{formatNumber(item.amount)}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTransaction(item)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.gray400} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <Loading text="Tranzaksiyalar yuklanmoqda..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moliya</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.balanceCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.balanceLabel}>Umumiy balans</Text>
        <Text style={styles.balanceValue}>
          {totals.balance >= 0 ? '+' : ''}{formatNumber(totals.balance)} UZS
        </Text>
        <View style={styles.balanceStats}>
          <View style={styles.balanceStat}>
            <View style={styles.balanceStatIcon}>
              <Ionicons name="arrow-up" size={16} color={COLORS.success} />
            </View>
            <View>
              <Text style={styles.balanceStatLabel}>Daromad</Text>
              <Text style={styles.balanceStatValue}>+{formatNumber(totals.income)}</Text>
            </View>
          </View>
          <View style={styles.balanceStat}>
            <View style={styles.balanceStatIcon}>
              <Ionicons name="arrow-down" size={16} color={COLORS.error} />
            </View>
            <View>
              <Text style={styles.balanceStatLabel}>Xarajat</Text>
              <Text style={styles.balanceStatValue}>-{formatNumber(totals.expense)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'income', 'expense'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Barchasi' : f === 'income' ? 'Daromad' : 'Xarajat'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="Tranzaksiyalar yo'q"
          description="Yangi tranzaksiya qo'shish uchun + tugmasini bosing"
          buttonTitle="Tranzaksiya qo'shish"
          onButtonPress={() => setModalVisible(true)}
        />
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      {/* Add Transaction Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yangi tranzaksiya</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  newTransaction.type === 'income' && styles.typeOptionActiveIncome
                ]}
                onPress={() => setNewTransaction({ ...newTransaction, type: 'income' })}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={24}
                  color={newTransaction.type === 'income' ? COLORS.success : COLORS.gray400}
                />
                <Text style={[
                  styles.typeOptionText,
                  newTransaction.type === 'income' && { color: COLORS.success }
                ]}>
                  Daromad
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  newTransaction.type === 'expense' && styles.typeOptionActiveExpense
                ]}
                onPress={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={24}
                  color={newTransaction.type === 'expense' ? COLORS.error : COLORS.gray400}
                />
                <Text style={[
                  styles.typeOptionText,
                  newTransaction.type === 'expense' && { color: COLORS.error }
                ]}>
                  Xarajat
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Nomi"
              placeholder="Masalan: Oziq-ovqat"
              value={newTransaction.title}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, title: text })}
            />

            <Input
              label="Summa (UZS)"
              placeholder="100000"
              value={newTransaction.amount}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text })}
              keyboardType="numeric"
            />

            <Button
              title="Qo'shish"
              onPress={handleAddTransaction}
              loading={saving}
              style={styles.submitButton}
            />
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: SIZES.radius.xl,
    padding: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  balanceStatLabel: {
    fontSize: SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  balanceStatValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.md,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  transactionCard: {
    marginBottom: 10,
    padding: 14,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: SIZES.sm,
    color: COLORS.gray500,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: SIZES.base,
    fontWeight: '700',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  typeOptionActiveIncome: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.successBg,
  },
  typeOptionActiveExpense: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBg,
  },
  typeOptionText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray600,
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default FinanceScreen;
