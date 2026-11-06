import { InjectionToken } from '@angular/core';

const STORAGE_KEY = 'team-up.theme';

export interface ThemeStorage {
  read(): string | null;
  write(value: string): void;
}

// The preference only matters on this device, and the app works without it:
// storage can be unavailable in a private window, so failures are ignored.
export const browserThemeStorage = (storage: () => Storage): ThemeStorage => ({
  read: () => {
    try {
      return storage().getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  write: (value) => {
    try {
      storage().setItem(STORAGE_KEY, value);
    } catch {
      // The preference then lasts until the page is closed.
    }
  },
});

export const THEME_STORAGE = new InjectionToken<ThemeStorage>('THEME_STORAGE', {
  providedIn: 'root',
  factory: () => browserThemeStorage(() => localStorage),
});
