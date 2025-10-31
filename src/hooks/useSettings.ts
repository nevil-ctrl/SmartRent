import { useState, useEffect, useCallback } from 'react';

export interface Settings {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

const DEFAULT_SETTINGS: Settings = {
  language: 'ru',
  currency: 'MATIC',
  notifications: {
    email: true,
    push: false,
    sms: false,
  },
};

const SETTINGS_STORAGE_KEY = 'smartrent_settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    // Загружаем настройки из localStorage при инициализации
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Объединяем с настройками по умолчанию на случай, если структура изменилась
          return { ...DEFAULT_SETTINGS, ...parsed };
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Сохраняем настройки в localStorage при каждом изменении
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        // Применяем настройки к документу
        if (document && document.documentElement) {
          document.documentElement.setAttribute('data-lang', settings.language);
          document.documentElement.setAttribute('data-currency', settings.currency);
        }
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings]);

  // Применяем настройки при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined' && document && document.documentElement) {
      document.documentElement.setAttribute('data-lang', settings.language);
      document.documentElement.setAttribute('data-currency', settings.currency);
    }
  }, [settings.language, settings.currency]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const updateLanguage = useCallback((language: string) => {
    setSettings((prev) => ({ ...prev, language }));
  }, []);

  const updateCurrency = useCallback((currency: string) => {
    setSettings((prev) => ({ ...prev, currency }));
  }, []);

  const updateNotifications = useCallback((notifications: Partial<Settings['notifications']>) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...notifications },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SETTINGS_STORAGE_KEY);
        // Применяем сброшенные настройки
        if (document && document.documentElement) {
          document.documentElement.setAttribute('data-lang', DEFAULT_SETTINGS.language);
          document.documentElement.setAttribute('data-currency', DEFAULT_SETTINGS.currency);
        }
      } catch (error) {
        console.error('Failed to reset settings:', error);
      }
    }
  }, []);

  return {
    settings,
    updateSettings,
    updateLanguage,
    updateCurrency,
    updateNotifications,
    resetSettings,
  };
};

