import { ChangeDetectionStrategy, Component } from '@angular/core';

// Inline, so that it follows the brand color of the current theme.
@Component({
  selector: 'tu-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo.html',
  styleUrl: './logo.scss',
})
export class LogoComponent {}
