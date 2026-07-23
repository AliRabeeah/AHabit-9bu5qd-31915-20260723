import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // silently fail
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // silently fail
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch {
      return [];
    }
  },

  async exportAll(): Promise<Record<string, unknown>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result: Record<string, unknown> = {};
      for (const key of keys) {
        const val = await AsyncStorage.getItem(key);
        if (val) result[key] = JSON.parse(val);
      }
      return result;
    } catch {
      return {};
    }
  },
};
