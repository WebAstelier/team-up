import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CardComponent } from './card';

@Component({
  imports: [CardComponent],
  template: '<tu-card><p>Content</p></tu-card>',
})
class HostComponent {}

describe('CardComponent', () => {
  it('shows its content', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tu-card p').textContent).toBe('Content');
  });
});
