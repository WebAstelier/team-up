import { describe, expect, it, vi } from 'vitest';
import { browserThemeStorage } from './theme-storage';

const storageDouble = (values: Record<string, string> = {}) => ({
  getItem: vi.fn<(key: string) => string | null>((key) => values[key] ?? null),
  setItem: vi.fn<(key: string, value: string) => void>(),
});

const failing = (): Storage => {
  throw new Error('Storage is unavailable');
};

describe('browserThemeStorage', () => {
  it('reads the saved value', () => {
    const storage = storageDouble({ 'team-up.theme': 'dark' }) as unknown as Storage;

    expect(browserThemeStorage(() => storage).read()).toBe('dark');
  });

  it('writes under its key', () => {
    const storage = storageDouble();

    browserThemeStorage(() => storage as unknown as Storage).write('light');

    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith('team-up.theme', 'light');
  });

  it('reads nothing when storage is unavailable', () => {
    expect(browserThemeStorage(failing).read()).toBeNull();
  });

  it('ignores a write when storage is unavailable', () => {
    expect(() => browserThemeStorage(failing).write('dark')).not.toThrow();
  });
});
