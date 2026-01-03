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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';
import goalsService from '../../services/goalsService';

const GOAL_ICONS = [
  { id: 'trophy', icon: 'trophy-outline', color: '#F59E0B' },
  { id: 'fitness', icon: 'fitness-outline', color: '#10B981' },
  { id: 'book', icon: 'book-outline', color: '#3B82F6' },
  { id: 'cash', icon: 'cash-outline', color: '#8B5CF6' },
  { id: 'heart', icon: 'heart-outline', color: '#EF4444' },
  { id: 'briefcase', icon: 'briefcase-outline', color: '#6366F1' },
  { id: 'home', icon: 'home-outline', color: '#14B8A6' },
  { id: 'car', icon: 'car-outline', color: '#F97316' },
];

const NewGoalsScreen = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '0',
    icon: 'trophy',
  });

  const loadGoals = async () => {
    try {
      const data = await goalsService.getGoals();
      setGoals(data.goals || []);
    } catch (error) {
      console.log('Goals load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoals();
  }, []);

  const filteredGoals = filter === 'all'
    ? goals
    : goals.filter(g => g.status === filter);

  const completedCount = goals.filter(g => g.status === 'completed').length;
  const inProgressCount = goals.filter(g => g.status === 'in_progress').length;

  const getProgress = (goal) => {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  };

  const getGoalIcon = (iconId) => {
    return GOAL_ICONS.find(i => i.id === iconId) || GOAL_ICONS[0];
  };

  const addGoal = async () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Xatolik', 'Maqsad nomini kiriting');
      return;
    }

    const targetAmount = parseFloat(newGoal.targetAmount) || 100;

    try {
      const data = await goalsService.createGoal({
        ...newGoal,
        targetAmount,
        currentAmount: parseFloat(newGoal.currentAmount) || 0,
        status: 'in_progress',
      });
      if (data.goal) {
        setGoals([data.goal, ...goals]);
        setShowModal(false);
        setNewGoal({ title: '', description: '', targetAmount: '', currentAmount: '0', icon: 'trophy' });
      }
    } catch (error) {
      Alert.alert('Xatolik', "Maqsad qo'shishda xatolik");
    }
  };

  const updateProgress = async (goal, increment) => {
    const newAmount = Math.max(0, Math.min(goal.targetAmount, goal.currentAmount + increment));
    const newStatus = newAmount >= goal.targetAmount ? 'completed' : 'in_progress';

    try {
      await goalsService.updateGoal(goal._id, {
        currentAmount: newAmount,
        status: newStatus,
      });
      setGoals(goals.map(g =>
        g._id === goal._id ? { ...g, currentAmount: newAmount, status: newStatus } : g
      ));
    } catch (error) {
      Alert.alert('Xatolik', 'Yangilashda xatolik');
    }
  };

  const deleteGoal = async (id) => {
    Alert.alert(
      "O'chirish",
      "Maqsadni o'chirishni xohlaysizmi?",
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            try {
              await goalsService.deleteGoal(id);
              setGoals(goals.filter(g => g._id !== id));
            } catch (error) {
              Alert.alert('Xatolik', "O'chirishda xatolik");
            }
          },
        },
      ]
    );
  };

  const renderGoal = ({ item }) => {
    const progress = getProgress(item);
    const goalIcon = getGoalIcon(item.icon);
    const isCompleted = item.status === 'completed';

    return (
      <TouchableOpacity
        style={styles.goalCard}
        onLongPress={() => deleteGoal(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.goalHeader}>
          <View style={[styles.goalIconBox, { backgroundColor: goalIcon.color + '20' }]}>
            <Ionicons name={goalIcon.icon} size={24} color={goalIcon.color} />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle} numberOfLines={1}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.goalDescription} numberOfLines={1}>{item.description}</Text>
            ) : null}
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: isCompleted ? '#10B981' : COLORS.primary },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        <View style={styles.goalFooter}>
          <Text style={styles.goalAmount}>
            {item.currentAmount?.toLocaleString()} / {item.targetAmount?.toLocaleString()}
          </Text>
          {!isCompleted && (
            <View style={styles.goalActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => updateProgress(item, -Math.ceil(item.targetAmount * 0.1))}
              >
                <Ionicons name="remove" size={18} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => updateProgress(item, Math.ceil(item.targetAmount * 0.1))}
              >
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Maqsadlar</Text>
          <Text style={styles.headerSubtitle}>
            {completedCount} bajarildi, {inProgressCount} jarayonda
          </Text>
        </View>
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

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="flag-outline" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{goals.length}</Text>
          <Text style={styles.statLabel}>Jami</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="time-outline" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>Jarayonda</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Bajarildi</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        {[
          { id: 'all', label: 'Barchasi' },
          { id: 'in_progress', label: 'Jarayonda' },
          { id: 'completed', label: 'Bajarildi' },
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

      {/* Goals List */}
      <FlatList
        data={filteredGoals}
        renderItem={renderGoal}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.goalsList}
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
            <Ionicons name="trophy-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Maqsadlar yo'q</Text>
            <Text style={styles.emptySubtitle}>
              Yangi maqsad qo'shish uchun + tugmasini bosing
            </Text>
          </View>
        }
      />

      {/* Add Goal Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yangi maqsad</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Maqsad nomi"
              placeholderTextColor="#9CA3AF"
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tavsif (ixtiyoriy)"
              placeholderTextColor="#9CA3AF"
              value={newGoal.description}
              onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
              multiline
              numberOfLines={2}
            />

            <TextInput
              style={styles.input}
              placeholder="Maqsad miqdori (masalan: 1000000)"
              placeholderTextColor="#9CA3AF"
              value={newGoal.targetAmount}
              onChangeText={(text) => setNewGoal({ ...newGoal, targetAmount: text.replace(/[^0-9]/g, '') })}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Ikonka</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.iconsRow}>
                {GOAL_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.id}
                    style={[
                      styles.iconOption,
                      newGoal.icon === icon.id && { backgroundColor: icon.color },
                    ]}
                    onPress={() => setNewGoal({ ...newGoal, icon: icon.id })}
                  >
                    <Ionicons
                      name={icon.icon}
                      size={24}
                      color={newGoal.icon === icon.id ? '#fff' : icon.color}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={addGoal}>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  goalsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  goalDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  completedBadge: {
    marginLeft: 8,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    width: 40,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.primary,
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
    maxHeight: '80%',
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
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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

export default NewGoalsScreen;
