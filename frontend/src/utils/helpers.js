import dayjs from '../lib/dayjs';

export const formatDate = (date, formatStr = 'DD MMM YYYY') => {
  if (!date) return '-';
  try {
    return dayjs(date).format(formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '-';
  try {
    return dayjs(date).fromNow();
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '-';
  }
};

export const isDeadlineNear = (deadline) => {
  if (!deadline) return false;
  const days = dayjs(deadline).diff(dayjs(), 'day');
  return days >= 0 && days <= 3;
};

export const isOverdue = (deadline) => {
  if (!deadline) return false;
  return dayjs(deadline).isBefore(dayjs());
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };
  return colors[priority] || colors.medium;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
    in_progress: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    completed: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };
  return colors[status] || colors.pending;
};

export const getStatusLabel = (status) => {
  const labels = {
    in_progress: 'Jarayonda',
    completed: 'Bajarildi',
  };
  return labels[status] || status;
};
export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Hozir';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} daqiqa oldin`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} kun oldin`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} hafta oldin`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} oy oldin`;

  const years = Math.floor(days / 365);
  return `${years} yil oldin`;
};
export const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Past',
    medium: 'O\'rta',
    high: 'Yuqori',
  };
  return labels[priority] || priority;
};

export const truncate = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Xayrli tong';
  if (hour < 18) return 'Xayrli kun';
  return 'Xayrli kech';
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  if (phone.startsWith('+998')) {
    return phone.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3-$4-$5');
  }
  return phone;
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};
