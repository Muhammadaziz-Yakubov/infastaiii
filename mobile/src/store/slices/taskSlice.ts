import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '@/types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
    category?: string;
  };
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters?: any, { rejectWithValue }) => {
    try {
      // API call will be implemented later
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const { id, updates } = action.payload;
      const index = state.tasks.findIndex(task => task._id === id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...updates };
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  addTask,
  updateTask,
  deleteTask,
  setCurrentTask,
} = taskSlice.actions;

export default taskSlice.reducer;
