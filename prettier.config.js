module.exports = {
  plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
  arrowParens: 'avoid',
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  tabWidth: 4,
  trailingComma: 'all',
  tailwindFunctions: ['clsx'],
  organizeImportsSkipDestructiveCodeActions: true,
}
