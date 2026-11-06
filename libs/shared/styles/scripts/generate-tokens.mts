// Writes the style files from tokens.json. With --check, fails if they are out of date instead.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderTokens, type RenderedTokens, type Tokens } from '../src/lib/render-tokens.ts';

const root = join(import.meta.dirname, '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8')) as Tokens;
const rendered = renderTokens(tokens);
const fileNames = Object.keys(rendered) as (keyof RenderedTokens)[];
const pathOf = (fileName: string): string => join(root, 'src', fileName);

if (process.argv.includes('--check')) {
  const outdated = fileNames.filter(
    (fileName) =>
      !existsSync(pathOf(fileName)) ||
      readFileSync(pathOf(fileName), 'utf8') !== rendered[fileName],
  );
  if (outdated.length > 0) {
    console.error(`Out of date: ${outdated.join(', ')}. Run nx run shared-styles:generate-tokens.`);
    process.exit(1);
  }
  console.log('Generated style files match tokens.json.');
} else {
  for (const fileName of fileNames) {
    writeFileSync(pathOf(fileName), rendered[fileName]);
  }
  console.log(`Generated ${fileNames.join(', ')}.`);
}
