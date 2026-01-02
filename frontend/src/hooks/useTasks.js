// src/hooks/useTasks.js
import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import toast from 'react-hot-toast';

export const useTasks = (filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks(filters);
      setTasks(response.tasks);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Vazifalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks([response.task, ...tasks]);
      toast.success('Vazifa yaratildi');
      return response.task;
    } catch (err) {
      toast.error('Xatolik yuz berdi');
      throw err;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await taskService.updateTask(id, taskData);
      setTasks(tasks.map(t => t._id === id ? response.task : t));
      toast.success('Vazifa yangilandi');
      return response.task;
    } catch (err) {
      toast.error('Xatolik yuz berdi');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Vazifa o\'chirildi');
    } catch (err) {
      toast.error('Xatolik yuz berdi');
      throw err;
    }
  };

  const toggleTask = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      if (!task) throw new Error('Vazifa topilmadi');
      
      const response = await taskService.toggleTask(id, task.status);
      setTasks(tasks.map(t => t._id === id ? response.task : t));
      toast.success('Vazifa yangilandi');
      return response.task;
    } catch (err) {
      toast.error('Xatolik yuz berdi');
      throw err;
    }
  };

  const bulkDelete = async (taskIds) => {
    try {
      await taskService.bulkDelete(taskIds);
      setTasks(tasks.filter(t => !taskIds.includes(t._id)));
      toast.success(`${taskIds.length} ta vazifa o'chirildi`);
    } catch (err) {
      toast.error('Xatolik yuz berdi');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    bulkDelete
  };
};