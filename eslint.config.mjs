// ESLint only enforces module boundaries. All other linting is done by oxlint.
import nx from '@nx/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const domains = ['party', 'participant', 'action', 'engine', 'killer'];

// A domain depends only on itself, on cross-cutting libs and on the models of other domains.
const scopeConstraints = domains.map((domain) => ({
  sourceTag: `scope:${domain}`,
  onlyDependOnLibsWithTags: [`scope:${domain}`, 'scope:shared', 'type:models'],
}));

const typeConstraints = [
  {
    sourceTag: 'type:feature',
    onlyDependOnLibsWithTags: [
      'type:feature',
      'type:data-access',
      'type:ui',
      'type:util',
      'type:models',
    ],
  },
  {
    sourceTag: 'type:data-access',
    onlyDependOnLibsWithTags: ['type:data-access', 'type:util', 'type:models'],
  },
  { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:ui', 'type:util', 'type:models'] },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util', 'type:models'] },
  {
    // Models are shared between web and API: no framework, no runtime dependency.
    sourceTag: 'type:models',
    onlyDependOnLibsWithTags: ['type:models'],
    bannedExternalImports: [
      '@angular/*',
      '@ngrx/*',
      'rxjs',
      'rxjs/*',
      'hono',
      'hono/*',
      '@hono/*',
      'better-sqlite3',
    ],
  },
];

const platformConstraints = [
  {
    sourceTag: 'platform:web',
    onlyDependOnLibsWithTags: ['platform:web', 'platform:shared'],
    bannedExternalImports: ['hono', 'hono/*', '@hono/*', 'better-sqlite3'],
  },
  {
    sourceTag: 'platform:api',
    onlyDependOnLibsWithTags: ['platform:api', 'platform:shared'],
    bannedExternalImports: ['@angular/*', '@ngrx/*'],
  },
  { sourceTag: 'platform:shared', onlyDependOnLibsWithTags: ['platform:shared'] },
];

export default [
  { ignores: ['**/dist', '**/tmp', '**/coverage', '**/node_modules', '**/.nx'] },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
    plugins: { '@nx': nx },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            ...scopeConstraints,
            // Cross-cutting libs never know about a domain.
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
            // Apps assemble domains, and nothing may depend on an app.
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: [
                ...domains.map((domain) => `scope:${domain}`),
                'scope:shared',
              ],
            },
            ...typeConstraints,
            ...platformConstraints,
          ],
        },
      ],
    },
  },
];
