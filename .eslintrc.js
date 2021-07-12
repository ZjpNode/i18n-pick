
module.exports =  {    
  'parserOptions': { 'ecmaVersion': 2017 },
  'env': {
    node: true
  },
  'extends': 'eslint:recommended',
  'rules': {
    'semi': ['error', 'never'],
    'quotes': ['error', 'single'],
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    'arrow-spacing': ['error', { 'before': true, 'after': true }],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', 'always'],
    'object-curly-spacing': ['error', 'always']
  }
}