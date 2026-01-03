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
import goalsService from '../../services/goalsService';

const GoalsScreen = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', currentAmount: '0' });
  const [saving, setSaving] = useState(false);

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

  const handleDeleteGoal = (goal) => {
    Alert.alert(
      "O'chirish",
      `"${goal.title}" maqsadini o'chirmoqchimisiz?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            try {
              await goalsService.deleteGoal(goal._id);
              setGoals(prev => prev.filter(g => g._id !== goal._id));
            } catch (error) {
              Alert.alert('Xatolik', "Maqsadni o'chirib bo'lmadi");
            }
          },
        },
      ]
    );
  };

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Xatolik', 'Maqsad nomini kiriting');
      return;
    }
    if (!newGoal.targetAmount || isNaN(Number(newGoal.targetAmount))) {
      Alert.alert('Xatolik', "To'g'ri maqsad summasini kiriting");
      return;
    }

    setSaving(true);
    try {
      const result = await goalsService.createGoal({
        title: newGoal.title.trim(),
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount) || 0,
        type: 'financial',
      });
      if (result.goal) {
        setGoals(prev => [result.goal, ...prev]);
      }
      setModalVisible(false);
      setNewGoal({ title: '', targetAmount: '', currentAmount: '0' });
    } catch (error) {
      Alert.alert('Xatolik', "Maqsad qo'shib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProgress = async (goal) => {
    Alert.prompt(
      'Progress yangilash',
      `Hozirgi summa: ${goal.currentAmount?.toLocaleString() || 0} UZS`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Saqlash',
          onPress: async (value) => {
            if (!value || isNaN(Number(value))) return;
            try {
              const newAmount = Number(value);
              await goalsService.updateGoal(goal._id, { currentAmount: newAmount });
              setGoals(prev =>
                prev.map(g =>
                  g._id === goal._id
                    ? { ...g, currentAmount: newAmount, progress: Math.min(100, Math.round((newAmount / g.targetAmount) * 100)) }
                    : g
                )
              );
            } catch (error) {
              Alert.alert('Xatolik', "Progressni yangilab bo'lmadi");
            }
          },
        },
      ],
      'plain-text',
      String(goal.currentAmount || 0),
      'numeric'
    );
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return [COLORS.success, '#059669'];
    if (progress >= 50) return [COLORS.primary, COLORS.primaryDark];
    return [COLORS.warning, '#D97706'];
  };

  const renderGoal = ({ item }) => {
    const progress = item.progress || Math.min(100, Math.round(((item.currentAmount || 0) / (item.targetAmount || 1)) * 100));
    const colors = getProgressColor(progress);

    return (
      <Card style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalIconBox}>
            <Ionicons 
              name={progress >= 100 ? "trophy" : "flag"} 
              size={24} 
              color={colors[0]} 
            />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{item.title}</Text>
            <Text style={styles.goalAmount}>
              {formatNumber(item.currentAmount)} / {formatNumber(item.targetAmount)} UZS
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteGoal(item)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors[0] }]}>{progress}%</Text>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => handleUpdateProgress(item)}
        >
          <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
          <Text style={styles.updateButtonText}>Progress yangilash</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  if (loading) {
    return <Loading text="Maqsadlar yuklanmoqda..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maqsadlar</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{goals.length}</Text>
          <Text style={styles.statLabel}>Jami</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {goals.filter(g => (g.progress || 0) >= 100).length}
          </Text>
          <Text style={styles.statLabel}>Erishilgan</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {goals.filter(g => (g.progress || 0) < 100).length}
          </Text>
          <Text style={styles.statLabel}>Jarayonda</Text>
        </View>
      </View>

      {/* Goals List */}
      {goals.length === 0 ? (
        <EmptyState
          icon="trophy-outline"
          title="Maqsadlar yo'q"
          description="Yangi maqsad qo'shish uchun + tugmasini bosing"
          buttonTitle="Maqsad qo'shish"
          onButtonPress={() => setModalVisible(true)}
        />
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
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

      {/* Add Goal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yangi maqsad</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>

            <Input
              label="Maqsad nomi"
              placeholder="Masalan: Yangi telefon"
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
            />

            <Input
              label="Maqsad summasi (UZS)"
              placeholder="5000000"
              value={newGoal.targetAmount}
              onChangeText={(text) => setNewGoal({ ...newGoal, targetAmount: text })}
              keyboardType="numeric"
            />

            <Input
              label="Hozirgi summa (UZS)"
              placeholder="0"
              value={newGoal.currentAmount}
              onChangeText={(text) => setNewGoal({ ...newGoal, currentAmount: text })}
              keyboardType="numeric"
            />

            <Button
              title="Qo'shish"
              onPress={handleAddGoal}
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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: SIZES.radius.lg,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.gray500,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  goalCard: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: SIZES.sm,
    color: COLORS.gray500,
  },
  deleteButton: {
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.gray100,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
  },
  updateButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
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
  submitButton: {
    marginTop: 8,
  },
});

export default GoalsScreen;
