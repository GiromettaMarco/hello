import glsl from 'vite-plugin-glsl'
import inlineSource from 'vite-plugin-inline-source'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    htmlWhitespaceSensitivity: 'css',
    ignorePatterns: ['pnpm-lock.yaml', 'public', 'index.html'],
    printWidth: 100,
    semi: false,
    singleAttributePerLine: true,
    singleQuote: true,
    sortImports: {
      newlinesBetween: false,
      partitionByComment: true,
      partitionByNewline: true
    },
    sortPackageJson: {
      sortScripts: true
    },
    tabWidth: 2,
    trailingComma: 'none'
  },
  lint: {
    categories: {
      correctness: 'warn'
    },
    env: {
      builtin: true
    },
    ignorePatterns: ['node_modules', 'public'],
    jsPlugins: [
      'eslint-plugin-perfectionist',
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }
    ],
    options: { typeAware: true, typeCheck: true },
    plugins: ['oxc', 'typescript', 'unicorn'],
    rules: {
      'no-array-constructor': 'error',
      'no-unused-expressions': 'error',
      'no-unused-vars': 'error',
      'no-var': 'error',
      'perfectionist/sort-interfaces': 'warn',
      'perfectionist/sort-jsx-props': 'warn',
      'perfectionist/sort-object-types': 'warn',
      'perfectionist/sort-objects': 'warn',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'sort-vars': 'warn',
      'typescript/ban-ts-comment': 'error',
      'typescript/no-duplicate-enum-values': 'error',
      'typescript/no-empty-object-type': 'error',
      'typescript/no-explicit-any': 'error',
      'typescript/no-extra-non-null-assertion': 'error',
      'typescript/no-misused-new': 'error',
      'typescript/no-namespace': ['error', { allowDeclarations: true }],
      'typescript/no-non-null-asserted-optional-chain': 'error',
      'typescript/no-require-imports': 'error',
      'typescript/no-this-alias': 'error',
      'typescript/no-unnecessary-type-constraint': 'error',
      'typescript/no-unsafe-declaration-merging': 'error',
      'typescript/no-unsafe-function-type': 'error',
      'typescript/no-wrapper-object-types': 'error',
      'typescript/prefer-as-const': 'error',
      'typescript/prefer-namespace-keyword': 'error',
      'typescript/triple-slash-reference': 'error',
      'vite-plus/prefer-vite-plus-imports': 'error'
    }
  },
  plugins: [glsl(), inlineSource()],
  resolve: {
    tsconfigPaths: true
  },
  staged: {
    '*': 'vp check --fix'
  }
})
