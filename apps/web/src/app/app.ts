import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { FrameComponent } from '@team-up/web/layout';

@Component({
  imports: [FrameComponent, RouterOutlet],
  selector: 'app-root',
  template: '<tu-frame><router-outlet /></tu-frame>',
})
export class App {
  public constructor() {
    const title = inject(Title);
    inject(TranslocoService)
      .selectTranslate<string>('app.title')
      .pipe(takeUntilDestroyed())
      .subscribe((value) => title.setTitle(value));
  }
}
