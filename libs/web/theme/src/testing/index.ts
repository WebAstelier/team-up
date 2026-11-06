import type { ThemeStorage } from '../lib/theme-storage';

export const createThemeStorageDouble = (
  saved: string | null = null,
): ThemeStorage & { written: string[] } => {
  const written: string[] = [];
  return {
    written,
    read: () => saved,
    write: (value) => {
      written.push(value);
    },
  };
};
