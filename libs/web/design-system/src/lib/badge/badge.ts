import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeStatus = 'yes' | 'maybe' | 'no' | 'neutral' | 'active';

// A solid badge. Its word carries the meaning: the color never does on its own.
@Component({
  selector: 'tu-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styleUrl: './badge.scss',
  host: { '[class]': '"badge--" + status()' },
})
export class BadgeComponent {
  public readonly status = input<BadgeStatus>('neutral');
}
