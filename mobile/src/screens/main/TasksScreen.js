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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { Card, Loading, EmptyState, Button, Input } from '../../components/common';
import taskService from '../../services/taskService';

const TasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      console.log('Tasks load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks();
  }, []);

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await taskService.updateTask(task._id, { status: newStatus });
      setTasks(prev => 
        prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t)
      );
    } catch (error) {
      Alert.alert('Xatolik', "Vazifa holatini o'zgartirib bo'lmadi");
    }
  };

  const handleDeleteTask = (task) => {
    Alert.alert(
      "O'chirish",
      `"${task.title}" vazifasini o'chirmoqchimisiz?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.deleteTask(task._id);
              setTasks(prev => prev.filter(t => t._id !== task._id));
            } catch (error) {
              Alert.alert('Xatolik', "Vazifani o'chirib bo'lmadi");
            }
          },
        },
      ]
    );
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Xatolik', 'Vazifa nomini kiriting');
      return;
    }

    setSaving(true);
    try {
      const result = await taskService.createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
      });
      if (result.task) {
        setTasks(prev => [result.task, ...prev]);
      }
      setModalVisible(false);
      setNewTask({ title: '', description: '', priority: 'medium' });
    } catch (error) {
      Alert.alert('Xatolik', "Vazifa qo'shib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.gray400;
    }
  };

  const renderTask = ({ item }) => (
    <Card style={styles.taskCard}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => handleToggleComplete(item)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          item.status === 'completed' && styles.checkboxCompleted
        ]}>
          {item.status === 'completed' && (
            <Ionicons name="checkmark" size={16} color={COLORS.white} />
          )}
        </View>
        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskTitle,
            item.status === 'completed' && styles.taskTitleCompleted
          ]}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.taskDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.taskMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority === 'high' ? 'Yuqori' : item.priority === 'medium' ? "O'rta" : 'Past'}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTask(item)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return <Loading text="Vazifalar yuklanmoqda..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vazifalar</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Barchasi' : f === 'pending' ? 'Jarayonda' : 'Bajarilgan'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon="checkbox-outline"
          title="Vazifalar yo'q"
          description="Yangi vazifa qo'shish uchun + tugmasini bosing"
          buttonTitle="Vazifa qo'shish"
          onButtonPress={() => setModalVisible(true)}
        />
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
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

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yangi vazifa</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>

            <Input
              label="Vazifa nomi"
              placeholder="Vazifa nomini kiriting"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />

            <Input
              label="Tavsif (ixtiyoriy)"
              placeholder="Qo'shimcha ma'lumot"
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.priorityLabel}>Muhimlik darajasi</Text>
            <View style={styles.priorityOptions}>
              {['low', 'medium', 'high'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    newTask.priority === p && styles.priorityOptionActive,
                    { borderColor: getPriorityColor(p) }
                  ]}
                  onPress={() => setNewTask({ ...newTask, priority: p })}
                >
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(p) }]} />
                  <Text style={[
                    styles.priorityOptionText,
                    newTask.priority === p && { color: getPriorityColor(p) }
                  ]}>
                    {p === 'high' ? 'Yuqori' : p === 'medium' ? "O'rta" : 'Past'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Qo'shish"
              onPress={handleAddTask}
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
  taskCard: {
    marginBottom: 12,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.gray400,
  },
  taskDescription: {
    fontSize: SIZES.sm,
    color: COLORS.gray500,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  priorityText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
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
    maxHeight: '80%',
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
  priorityLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 12,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: COLORS.gray50,
  },
  priorityOptionActive: {
    backgroundColor: COLORS.white,
  },
  priorityOptionText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default TasksScreen;
