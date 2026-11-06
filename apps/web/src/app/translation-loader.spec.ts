import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { TranslationLoader } from './translation-loader';

describe('TranslationLoader', () => {
  it('loads the French translations', async () => {
    const translations = await firstValueFrom(new TranslationLoader().getTranslation('fr'));

    expect(translations).toHaveProperty('app.title');
  });

  it('rejects an unknown language', () => {
    expect(() => new TranslationLoader().getTranslation('xx')).toThrow('Unknown language: xx');
  });
});
