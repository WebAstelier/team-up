import { DOCUMENT } from '@angular/common';
import { type EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { THEME_STORAGE } from './theme-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

const isForced = (value: string | null): value is 'light' | 'dark' =>
  value === 'light' || value === 'dark';

// By default the theme follows the phone. A preference forces it, on this device only.
export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState<{ preference: ThemePreference }>(() => {
    const saved = inject(THEME_STORAGE).read();
    return { preference: isForced(saved) ? saved : 'system' };
  }),
  withMethods((store, storage = inject(THEME_STORAGE), document = inject(DOCUMENT)) => {
    const apply = (): void => {
      const preference = store.preference();
      if (preference === 'system') {
        delete document.documentElement.dataset['theme'];
      } else {
        document.documentElement.dataset['theme'] = preference;
      }
    };
    return {
      apply,
      setPreference: (preference: ThemePreference): void => {
        patchState(store, { preference });
        storage.write(preference);
        apply();
      },
    };
  }),
  withHooks({
    onInit: (store) => {
      store.apply();
    },
  }),
);

// Applies the saved preference when the app starts.
export const provideTheme = (): EnvironmentProviders =>
  provideAppInitializer(() => {
    inject(ThemeStore);
  });
