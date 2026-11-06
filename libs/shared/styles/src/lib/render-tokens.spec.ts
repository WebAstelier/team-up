import { describe, expect, it } from 'vitest';
import { renderTokens, type Tokens } from './render-tokens';

const tokens: Tokens = {
  color: { tokens: [{ name: 'ink', value: { light: '#111111', dark: '#eeeeee' } }] },
  shadow: { tokens: [{ name: 'shadow-card', value: { light: '0 1px red', dark: '0 2px blue' } }] },
  type: {
    family: 'Inter, sans-serif',
    styles: [
      { name: 'body', fontSize: '1rem', lineHeight: 1.5, fontWeight: 400 },
      {
        name: 'label',
        fontSize: '0.75rem',
        lineHeight: 1.35,
        fontWeight: 600,
        letterSpacing: '0.08em',
      },
    ],
  },
  scss: {
    spacing: [{ name: 'space-1', value: '0.25rem' }],
    motion: [{ name: 'duration-fast', value: '150ms' }],
  },
};

describe('renderTokens', () => {
  const { 'themes.css': themes, '_tokens.scss': scss } = renderTokens(tokens);

  it('uses the light values by default', () => {
    expect(themes).toContain(':root {\n  --ink: #111111;\n  --shadow-card: 0 1px red;\n}');
  });

  it('follows the system dark theme, unless the light theme is forced', () => {
    expect(themes).toContain(
      "@media (prefers-color-scheme: dark) {\n  :root:not([data-theme='light']) {\n    --ink: #eeeeee;\n    --shadow-card: 0 2px blue;\n    color-scheme: dark;",
    );
  });

  it('applies the forced dark theme', () => {
    expect(themes).toContain(
      ":root[data-theme='dark'] {\n  --ink: #eeeeee;\n  --shadow-card: 0 2px blue;\n  color-scheme: dark;\n}",
    );
  });

  it('keeps themed values out of the SCSS variables', () => {
    expect(scss).not.toContain('shadow-card');
    expect(scss).not.toContain('#111111');
  });

  it('renders each SCSS group', () => {
    expect(scss).toContain('// spacing\n$space-1: 0.25rem;');
    expect(scss).toContain('// motion\n$duration-fast: 150ms;');
  });

  it('renders the font family and the type styles', () => {
    expect(scss).toContain('$font-sans: Inter, sans-serif;');
    expect(scss).toContain(
      '$type-body-size: 1rem;\n$type-body-line-height: 1.5;\n$type-body-weight: 400;',
    );
  });

  it('only renders a letter spacing when there is one', () => {
    expect(scss).toContain('$type-label-letter-spacing: 0.08em;');
    expect(scss).not.toContain('$type-body-letter-spacing');
  });

  it('warns against editing the generated files', () => {
    expect(themes.split('\n')[0]).toContain('Do not edit by hand');
    expect(scss.split('\n')[0]).toContain('Do not edit by hand');
  });
});
