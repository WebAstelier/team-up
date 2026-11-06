import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { FrameComponent, type FrameWidth } from './frame';

@Component({
  imports: [FrameComponent],
  template: `<tu-frame [width]="width"><p>Content</p></tu-frame>`,
})
class HostComponent {
  public width: FrameWidth = 'app';
}

const render = (width: FrameWidth = 'app'): HTMLElement => {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.componentInstance.width = width;
  fixture.detectChanges();
  return fixture.nativeElement;
};

describe('FrameComponent', () => {
  it('puts its content in the main landmark', () => {
    expect(render().querySelector('main p')?.textContent).toBe('Content');
  });

  it('uses the app width by default', () => {
    expect(render().querySelector('.content--admin')).toBeNull();
  });

  it('can use the admin width', () => {
    expect(render('admin').querySelector('.content--admin')).not.toBeNull();
  });
});
