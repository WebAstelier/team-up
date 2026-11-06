import { Injectable } from '@angular/core';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';
import { from, type Observable } from 'rxjs';

const TRANSLATIONS: Readonly<Record<string, () => Promise<Translation>>> = {
  fr: () => import('../i18n/fr.json').then((module) => module.default),
};

// Loads the translations of this app only. Each lazy-loaded project provides its own scope.
@Injectable({ providedIn: 'root' })
export class TranslationLoader implements TranslocoLoader {
  public getTranslation(lang: string): Observable<Translation> {
    const load = TRANSLATIONS[lang];
    if (!load) {
      throw new Error(`Unknown language: ${lang}`);
    }
    return from(load());
  }
}
