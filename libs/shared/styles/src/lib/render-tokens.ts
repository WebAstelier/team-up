interface ThemedToken {
  name: string;
  value: { light: string; dark: string };
}

interface ValueToken {
  name: string;
  value: string;
}

interface TypeStyle {
  name: string;
  fontSize: string;
  lineHeight: number;
  fontWeight: number;
  letterSpacing?: string;
}

export interface Tokens {
  color: { tokens: ThemedToken[] };
  shadow: { tokens: ThemedToken[] };
  type: { family: string; styles: TypeStyle[] };
  scss: Record<string, ValueToken[]>;
}

export interface RenderedTokens {
  'themes.css': string;
  '_tokens.scss': string;
}

const NOTICE =
  'Generated from tokens.json. Do not edit by hand: run nx run shared-styles:generate-tokens.';

const themeBlock = (tokens: ThemedToken[], theme: 'light' | 'dark', indent: string): string =>
  tokens.map(({ name, value }) => `${indent}--${name}: ${value[theme]};`).join('\n');

const renderThemes = ({ color, shadow }: Tokens): string => {
  const tokens = [...color.tokens, ...shadow.tokens];
  return `/* ${NOTICE} */
:root {
${themeBlock(tokens, 'light', '  ')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${themeBlock(tokens, 'dark', '    ')}
    color-scheme: dark;
  }
}

:root[data-theme='dark'] {
${themeBlock(tokens, 'dark', '  ')}
  color-scheme: dark;
}
`;
};

const renderTypeStyle = ({
  name,
  fontSize,
  lineHeight,
  fontWeight,
  letterSpacing,
}: TypeStyle): string =>
  [
    `$type-${name}-size: ${fontSize};`,
    `$type-${name}-line-height: ${lineHeight};`,
    `$type-${name}-weight: ${fontWeight};`,
    ...(letterSpacing ? [`$type-${name}-letter-spacing: ${letterSpacing};`] : []),
  ].join('\n');

const renderScss = ({ type, scss }: Tokens): string => {
  const groups = Object.entries(scss).map(
    ([group, tokens]) =>
      `// ${group}\n${tokens.map(({ name, value }) => `$${name}: ${value};`).join('\n')}`,
  );
  return `// ${NOTICE}
$font-sans: ${type.family};

${groups.join('\n\n')}

// type
${type.styles.map(renderTypeStyle).join('\n')}
`;
};

export const renderTokens = (tokens: Tokens): RenderedTokens => ({
  'themes.css': renderThemes(tokens),
  '_tokens.scss': renderScss(tokens),
});
