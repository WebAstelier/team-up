import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type FrameWidth = 'app' | 'admin';

// The frame around the whole screen: an outer border, a brand line, then the page.
@Component({
  selector: 'tu-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="line">
      <div class="screen">
        <main class="content" [class.content--admin]="width() === 'admin'">
          <ng-content />
        </main>
      </div>
    </div>
  `,
  styleUrl: './frame.scss',
})
export class FrameComponent {
  public readonly width = input<FrameWidth>('app');
}
