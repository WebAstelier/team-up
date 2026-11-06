import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

// An attribute on a native button, which keeps its keyboard and form behavior.
@Component({
  selector: 'button[tuButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
    }
    <ng-content />
  `,
  styleUrl: './button.scss',
  host: {
    '[attr.type]': 'type()',
    '[attr.disabled]': 'inactive() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '[class]': '"button--" + variant()',
    '[class.button--block]': 'block()',
    '[class.button--loading]': 'loading()',
  },
})
export class ButtonComponent {
  public readonly variant = input<ButtonVariant>('primary');
  public readonly type = input<'button' | 'submit'>('button');
  public readonly disabled = input(false, { transform: booleanAttribute });
  public readonly loading = input(false, { transform: booleanAttribute });
  public readonly block = input(false, { transform: booleanAttribute });

  // A loading button cannot be pressed again, so an action never runs twice.
  protected readonly inactive = computed(() => this.disabled() || this.loading());
}
