// IndexedDB orqali offline ma'lumotlarni saqlash

const DB_NAME = 'InFastOfflineDB';
const DB_VERSION = 1;

// Store nomlari
const STORES = {
  TASKS: 'tasks',
  TRANSACTIONS: 'transactions',
  DEBTS: 'debts',
  GOALS: 'goals',
  PENDING_SYNC: 'pendingSync',
};

// IndexedDB ni ochish
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Tasks store
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        db.createObjectStore(STORES.TASKS, { keyPath: '_id' });
      }

      // Transactions store
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        db.createObjectStore(STORES.TRANSACTIONS, { keyPath: '_id' });
      }

      // Debts store
      if (!db.objectStoreNames.contains(STORES.DEBTS)) {
        db.createObjectStore(STORES.DEBTS, { keyPath: '_id' });
      }

      // Goals store
      if (!db.objectStoreNames.contains(STORES.GOALS)) {
        db.createObjectStore(STORES.GOALS, { keyPath: '_id' });
      }

      // Pending sync store - offline paytida qilingan o'zgarishlar
      if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
        const syncStore = db.createObjectStore(STORES.PENDING_SYNC, { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Ma'lumotlarni saqlash
export const saveToOffline = async (storeName, data) => {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    if (Array.isArray(data)) {
      // Avval eski ma'lumotlarni tozalash
      store.clear();
      data.forEach(item => store.put(item));
    } else {
      store.put(data);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Offline saqlashda xatolik:', error);
    return false;
  }
};

// Ma'lumotlarni olish
export const getFromOffline = async (storeName) => {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Offline olishda xatolik:', error);
    return [];
  }
};

// Bitta elementni olish
export const getOneFromOffline = async (storeName, id) => {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Offline olishda xatolik:', error);
    return null;
  }
};

// Elementni o'chirish
export const deleteFromOffline = async (storeName, id) => {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Offline o\'chirishda xatolik:', error);
    return false;
  }
};

// Pending sync ga qo'shish (offline paytida qilingan o'zgarishlar)
export const addToPendingSync = async (action) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_SYNC);
    
    store.add({
      ...action,
      timestamp: Date.now(),
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Pending sync qo\'shishda xatolik:', error);
    return false;
  }
};

// Pending sync larni olish
export const getPendingSync = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.PENDING_SYNC, 'readonly');
    const store = tx.objectStore(STORES.PENDING_SYNC);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Pending sync olishda xatolik:', error);
    return [];
  }
};

// Pending sync ni tozalash
export const clearPendingSync = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_SYNC);
    store.clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Pending sync tozalashda xatolik:', error);
    return false;
  }
};

// Bitta pending sync ni o'chirish
export const removePendingSync = async (id) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.PENDING_SYNC, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_SYNC);
    store.delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Pending sync o\'chirishda xatolik:', error);
    return false;
  }
};

export { STORES };
