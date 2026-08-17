import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
  {
    ignores: ['dist/**', 'dist-ssr/**', 'coverage/**'],
  },
  ...pluginVue.configs['flat/essential'],
  ...tseslint.configs.recommended,
  {
    // typescript-eslint's recommended config sets a raw TS parser for all
    // files, which breaks parsing of .vue SFCs. Re-point .vue files back to
    // vue-eslint-parser, using the TS parser only for the <script> block.
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
)
