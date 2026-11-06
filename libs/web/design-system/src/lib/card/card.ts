import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tu-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styleUrl: './card.scss',
})
export class CardComponent {}
