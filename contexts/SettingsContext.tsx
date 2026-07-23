import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { StorageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants/config';

export interface AppSettings {
  theme: 'amoled' | 'light';
  accentColor: string;
  language: 'en' | 'ar';
  showStreak: boolean;
  showCompletionPercent: boolean;
  startOfWeek: 0 | 1;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'amoled',
  accentColor: '#7C5CFC',
  language: 'en',
  showStreak: true,
  showCompletionPercent: true,
  startOfWeek: 1,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    StorageService.get<AppSettings>(STORAGE_KEYS.SETTINGS).then(saved => {
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...saved });
    });
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await StorageService.set(STORAGE_KEYS.SETTINGS, updated);
  };

  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    await StorageService.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
