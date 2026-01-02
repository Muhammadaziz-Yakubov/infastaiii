export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 12 && cleaned.startsWith('998');
};

export const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Parol kamida 1 ta katta harfdan iborat bo\'lishi kerak';
  }
  if (!/[0-9]/.test(password)) {
    return 'Parol kamida 1 ta raqamdan iborat bo\'lishi kerak';
  }
  return null;
};

export const validateTask = (task) => {
  const errors = {};
  
  if (!task.title || task.title.trim().length < 3) {
    errors.title = 'Vazifa nomi kamida 3 ta belgidan iborat bo\'lishi kerak';
  }
  
  if (task.dueDate && new Date(task.dueDate) < new Date()) {
    errors.dueDate = 'Muddat o\'tgan sana bo\'lishi mumkin emas';
  }
  
  return errors;
};