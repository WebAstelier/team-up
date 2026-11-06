import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        TranslocoTestingModule.forRoot({
          langs: { fr: { app: { title: 'Test title' } } },
          translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
          preloadLangs: true,
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('holds the router outlet in the frame', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tu-frame router-outlet')).not.toBeNull();
  });

  it('translates the page title', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    expect(TestBed.inject(Title).getTitle()).toBe('Test title');
  });
});
