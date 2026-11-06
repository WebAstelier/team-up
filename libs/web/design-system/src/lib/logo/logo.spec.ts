import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LogoComponent } from './logo';

const render = (): SVGElement => {
  const fixture = TestBed.createComponent(LogoComponent);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('svg');
};

describe('LogoComponent', () => {
  it('has an accessible name', () => {
    expect(render().getAttribute('aria-label')).toBe('team-up');
    expect(render().getAttribute('role')).toBe('img');
  });

  it('takes its color from the theme', () => {
    const fills = [...render().querySelectorAll('[fill]')].map((path) => path.getAttribute('fill'));

    expect(new Set(fills)).toEqual(new Set(['currentColor']));
  });
});
