// Offline Storage and Local Database with Auto-Sync Queue

let memoryFallback: Record<string, string> = {};

// Universal storage adaptor (AsyncStorage for React Native, fallback for Node/testing)
const Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryFallback[key] || null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryFallback[key] = value;
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.removeItem(key);
    } catch {
      delete memoryFallback[key];
    }
  },
};

const KEYS = {
  AUTH_USER: "mak_auth_user",
  OVERHEAD_CACHE: "mak_overhead_cache",
  HALKHATA_CACHE_PREFIX: "mak_halkhata_",
  OFFLINE_QUEUE: "mak_offline_sync_queue",
  SAVINGS_CASH: "mak_latest_cash",
};

export interface OfflineSyncItem {
  id: string;
  type: "overhead_expense" | "halkhata_save";
  payload: any;
  timestamp: string;
}

export const OfflineDB = {
  // Authentication session
  async saveUser(user: { username: string; role: "admin" | "manager" | "viewer" }) {
    await Storage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
  },
  async getUser() {
    const raw = await Storage.getItem(KEYS.AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  },
  async clearUser() {
    await Storage.removeItem(KEYS.AUTH_USER);
  },

  // Overhead Expenses cache
  async cacheOverheadExpenses(items: any[]) {
    await Storage.setItem(KEYS.OVERHEAD_CACHE, JSON.stringify(items));
  },
  async getCachedOverheadExpenses() {
    const raw = await Storage.getItem(KEYS.OVERHEAD_CACHE);
    return raw ? JSON.parse(raw) : [];
  },

  // Hal Khata cache by date
  async cacheHalKhata(date: string, data: any) {
    await Storage.setItem(`${KEYS.HALKHATA_CACHE_PREFIX}${date}`, JSON.stringify(data));
  },
  async getCachedHalKhata(date: string) {
    const raw = await Storage.getItem(`${KEYS.HALKHATA_CACHE_PREFIX}${date}`);
    return raw ? JSON.parse(raw) : null;
  },

  // Offline queue for mutations
  async enqueueAction(action: Omit<OfflineSyncItem, "id" | "timestamp">) {
    const queue = await this.getQueue();
    const item: OfflineSyncItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      ...action,
      timestamp: new Date().toISOString(),
    };
    queue.push(item);
    await Storage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    return item;
  },
  async getQueue(): Promise<OfflineSyncItem[]> {
    const raw = await Storage.getItem(KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  },
  async clearQueue() {
    await Storage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  },
};
