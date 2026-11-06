import { DOCUMENT } from '@angular/common';
import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { createThemeStorageDouble } from '../testing';
import { THEME_STORAGE } from './theme-storage';
import { provideTheme, ThemeStore } from './theme.store';

const setup = (saved: string | null = null) => {
  const storage = createThemeStorageDouble(saved);
  const document = globalThis.document.implementation.createHTMLDocument();
  TestBed.configureTestingModule({
    providers: [
      { provide: THEME_STORAGE, useValue: storage },
      { provide: DOCUMENT, useValue: document },
    ],
  });
  return { storage, root: document.documentElement };
};

describe('ThemeStore', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('follows the phone by default', () => {
    const { root } = setup();

    expect(TestBed.inject(ThemeStore).preference()).toBe('system');
    expect(root.dataset['theme']).toBeUndefined();
  });

  it.each(['light', 'dark'] as const)('applies the saved %s preference', (saved) => {
    const { root } = setup(saved);

    expect(TestBed.inject(ThemeStore).preference()).toBe(saved);
    expect(root.dataset['theme']).toBe(saved);
  });

  it('ignores an invalid saved value', () => {
    const { root } = setup('purple');

    expect(TestBed.inject(ThemeStore).preference()).toBe('system');
    expect(root.dataset['theme']).toBeUndefined();
  });

  it('forces a theme and saves it', () => {
    const { storage, root } = setup();

    TestBed.inject(ThemeStore).setPreference('dark');

    expect(root.dataset['theme']).toBe('dark');
    expect(storage.written).toEqual(['dark']);
  });

  it('goes back to following the phone', () => {
    const { storage, root } = setup('dark');

    TestBed.inject(ThemeStore).setPreference('system');

    expect(root.dataset['theme']).toBeUndefined();
    expect(storage.written).toEqual(['system']);
  });
});

describe('provideTheme', () => {
  it('applies the saved preference at startup', async () => {
    TestBed.resetTestingModule();
    const { root } = setup('dark');
    TestBed.configureTestingModule({ providers: [provideTheme()] });

    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(root.dataset['theme']).toBe('dark');
  });
});
