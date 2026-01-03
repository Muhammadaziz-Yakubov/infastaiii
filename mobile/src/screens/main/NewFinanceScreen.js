import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import financeService from '../../services/financeService';

const { width } = Dimensions.get('window');

const TRANSACTION_TYPES = [
  { id: 'income', label: 'Daromad', icon: 'trending-up', color: '#10B981' },
  { id: 'expense', label: 'Xarajat', icon: 'trending-down', color: '#EF4444' },
];

const CATEGORIES = {
  income: [
    { id: 'salary', label: 'Maosh', icon: 'cash-outline' },
    { id: 'business', label: 'Biznes', icon: 'briefcase-outline' },
    { id: 'investment', label: 'Investitsiya', icon: 'trending-up-outline' },
    { id: 'other', label: 'Boshqa', icon: 'ellipsis-horizontal' },
  ],
  expense: [
    { id: 'food', label: 'Oziq-ovqat', icon: 'restaurant-outline' },
    { id: 'transport', label: 'Transport', icon: 'car-outline' },
    { id: 'shopping', label: 'Xarid', icon: 'cart-outline' },
    { id: 'bills', label: "To'lovlar", icon: 'receipt-outline' },
    { id: 'entertainment', label: "Ko'ngil ochar", icon: 'game-controller-outline' },
    { id: 'health', label: 'Salomatlik', icon: 'medical-outline' },
    { id: 'other', label: 'Boshqa', icon: 'ellipsis-horizontal' },
  ],
};

const NewFinanceScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: 'other',
    description: '',
  });

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

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const balance = income - expense;

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  const formatMoney = (amount) => {
    return amount.toLocaleString('uz-UZ') + ' UZS';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  };

  const addTransaction = async () => {
    const amount = parseFloat(newTransaction.amount);
    if (!amount || amount <= 0) {
      Alert.alert('Xatolik', "To'g'ri summa kiriting");
      return;
    }

    try {
      const data = await financeService.createTransaction({
        ...newTransaction,
        amount,
      });
      if (data.transaction) {
        setTransactions([data.transaction, ...transactions]);
        setShowModal(false);
        setNewTransaction({ type: 'expense', amount: '', category: 'other', description: '' });
      }
    } catch (error) {
      Alert.alert('Xatolik', "Tranzaksiya qo'shishda xatolik");
    }
  };

  const deleteTransaction = async (id) => {
    Alert.alert(
      "O'chirish",
      "Tranzaksiyani o'chirishni xohlaysizmi?",
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            try {
              await financeService.deleteTransaction(id);
              setTransactions(transactions.filter(t => t._id !== id));
            } catch (error) {
              Alert.alert('Xatolik', "O'chirishda xatolik");
            }
          },
        },
      ]
    );
  };

  const renderTransaction = ({ item }) => {
    const isIncome = item.type === 'income';
    const categories = CATEGORIES[item.type] || CATEGORIES.expense;
    const category = categories.find(c => c.id === item.category) || categories[categories.length - 1];

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        onLongPress={() => deleteTransaction(item._id)}
        activeOpacity={0.7}
      >
        <View style={[styles.transactionIcon, { backgroundColor: isIncome ? '#D1FAE5' : '#FEE2E2' }]}>
          <Ionicons
            name={category.icon}
            size={22}
            color={isIncome ? '#10B981' : '#EF4444'}
          />
        </View>
        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>{item.description || category.label}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={[styles.transactionAmount, { color: isIncome ? '#10B981' : '#EF4444' }]}>
          {isIncome ? '+' : '-'}{formatMoney(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moliya</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
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
        <Text style={styles.balanceValue}>{formatMoney(balance)}</Text>
        <View style={styles.balanceStats}>
          <View style={styles.balanceStat}>
            <View style={styles.balanceStatIcon}>
              <Ionicons name="arrow-up" size={16} color="#10B981" />
            </View>
            <View>
              <Text style={styles.balanceStatLabel}>Daromad</Text>
              <Text style={styles.balanceStatValue}>{formatMoney(income)}</Text>
            </View>
          </View>
          <View style={styles.balanceStatDivider} />
          <View style={styles.balanceStat}>
            <View style={styles.balanceStatIcon}>
              <Ionicons name="arrow-down" size={16} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.balanceStatLabel}>Xarajat</Text>
              <Text style={styles.balanceStatValue}>{formatMoney(expense)}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Filter */}
      <View style={styles.filterContainer}>
        {[
          { id: 'all', label: 'Barchasi' },
          { id: 'income', label: 'Daromad' },
          { id: 'expense', label: 'Xarajat' },
        ].map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Tranzaksiyalar yo'q</Text>
            <Text style={styles.emptySubtitle}>
              Yangi tranzaksiya qo'shish uchun + tugmasini bosing
            </Text>
          </View>
        }
      />

      {/* Add Transaction Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yangi tranzaksiya</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Type Selection */}
            <View style={styles.typeContainer}>
              {TRANSACTION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    newTransaction.type === type.id && { backgroundColor: type.color },
                  ]}
                  onPress={() => setNewTransaction({ ...newTransaction, type: type.id, category: 'other' })}
                >
                  <Ionicons
                    name={type.icon}
                    size={20}
                    color={newTransaction.type === type.id ? '#fff' : type.color}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      newTransaction.type === type.id && { color: '#fff' },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount */}
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>UZS</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                value={newTransaction.amount}
                onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
              />
            </View>

            {/* Category */}
            <Text style={styles.inputLabel}>Kategoriya</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionsRow}>
                {CATEGORIES[newTransaction.type].map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      newTransaction.category === cat.id && styles.categoryOptionActive,
                    ]}
                    onPress={() => setNewTransaction({ ...newTransaction, category: cat.id })}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={20}
                      color={newTransaction.category === cat.id ? '#fff' : '#6B7280'}
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        newTransaction.category === cat.id && { color: '#fff' },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Description */}
            <TextInput
              style={styles.input}
              placeholder="Izoh (ixtiyoriy)"
              placeholderTextColor="#9CA3AF"
              value={newTransaction.description}
              onChangeText={(text) => setNewTransaction({ ...newTransaction, description: text })}
            />

            <TouchableOpacity style={styles.submitButton} onPress={addTransaction}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>Qo'shish</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  addButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceStat: {
    flex: 1,
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
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  balanceStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  balanceStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  transactionsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  categoryOptionActive: {
    backgroundColor: COLORS.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default NewFinanceScreen;
