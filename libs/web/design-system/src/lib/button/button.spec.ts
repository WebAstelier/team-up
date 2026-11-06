import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ButtonComponent, type ButtonVariant } from './button';

@Component({
  imports: [ButtonComponent],
  template: `
    <button
      tuButton
      [variant]="variant()"
      [type]="type()"
      [disabled]="disabled()"
      [loading]="loading()"
      [block]="block()"
      (click)="pressed()"
    >
      Join
    </button>
  `,
})
class HostComponent {
  public readonly variant = signal<ButtonVariant>('primary');
  public readonly type = signal<'button' | 'submit'>('button');
  public readonly disabled = signal(false);
  public readonly loading = signal(false);
  public readonly block = signal(false);
  public readonly pressed = vi.fn<() => void>();
}

const setup = (change: (host: HostComponent) => void = () => undefined) => {
  const fixture = TestBed.createComponent(HostComponent);
  change(fixture.componentInstance);
  fixture.detectChanges();
  const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
  return { button, host: fixture.componentInstance };
};

describe('ButtonComponent', () => {
  it('is a primary button that does not submit forms by default', () => {
    const { button } = setup();

    expect(button.classList).toContain('button--primary');
    expect(button.type).toBe('button');
  });

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)('has the %s variant', (variant) => {
    const { button } = setup((host) => host.variant.set(variant));

    expect(button.classList).toContain(`button--${variant}`);
  });

  it('can submit a form', () => {
    const { button } = setup((host) => host.type.set('submit'));

    expect(button.type).toBe('submit');
  });

  it('can take the full width', () => {
    const { button } = setup((host) => host.block.set(true));

    expect(button.classList).toContain('button--block');
  });

  it('reacts to a press', () => {
    const { button, host } = setup();

    button.click();

    expect(host.pressed).toHaveBeenCalledOnce();
  });

  it('ignores a press when disabled', () => {
    const { button, host } = setup((value) => value.disabled.set(true));

    button.click();

    expect(button.disabled).toBe(true);
    expect(host.pressed).not.toHaveBeenCalled();
  });

  describe('while loading', () => {
    it('shows a spinner hidden from screen readers, and keeps its label', () => {
      const { button } = setup((host) => host.loading.set(true));

      expect(button.querySelector('.spinner')?.getAttribute('aria-hidden')).toBe('true');
      expect(button.textContent).toContain('Join');
    });

    it('announces that it is busy', () => {
      const { button } = setup((host) => host.loading.set(true));

      expect(button.getAttribute('aria-busy')).toBe('true');
    });

    it('ignores a press, so an action never runs twice', () => {
      const { button, host } = setup((value) => value.loading.set(true));

      button.click();

      expect(host.pressed).not.toHaveBeenCalled();
    });
  });

  it('has no spinner and is not busy otherwise', () => {
    const { button } = setup();

    expect(button.querySelector('.spinner')).toBeNull();
    expect(button.hasAttribute('aria-busy')).toBe(false);
  });
});
