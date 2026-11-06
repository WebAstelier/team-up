import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BadgeComponent, type BadgeStatus } from './badge';

@Component({
  imports: [BadgeComponent],
  template: '<tu-badge [status]="status()">Word</tu-badge>',
})
class HostComponent {
  public readonly status = signal<BadgeStatus>('neutral');
}

describe('BadgeComponent', () => {
  it.each(['yes', 'maybe', 'no', 'neutral', 'active'] as const)('shows the %s status', (status) => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.status.set(status);
    fixture.detectChanges();

    const badge: HTMLElement = fixture.nativeElement.querySelector('tu-badge');
    expect(badge.classList).toContain(`badge--${status}`);
    expect(badge.textContent).toBe('Word');
  });

  it('is neutral by default', () => {
    @Component({ imports: [BadgeComponent], template: '<tu-badge>Word</tu-badge>' })
    class DefaultHostComponent {}
    const fixture = TestBed.createComponent(DefaultHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tu-badge').classList).toContain('badge--neutral');
  });
});
