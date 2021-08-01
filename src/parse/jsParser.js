const { i18nIdentifier, quote } = require('../config.json')
const { isZh } = require('../utils')
const jscodeshift = require('jscodeshift')
const jsParser = jscodeshift.withParser('js')

module.exports = (content, { isVueScript = false } = {}) => {
  const ast = jsParser(content)
  const Literal = ast.find(jsParser.Literal)
  
  const i18nExpression = val => jsParser.callExpression(
    jsParser.identifier(isVueScript ? `this.${i18nIdentifier}` : i18nIdentifier),
    [jsParser.literal(val)]
  )

  Literal.filter(nodePath => {
      return isZh(nodePath.value.value)
    })
    .replaceWith(nodePath => {
     return i18nExpression(nodePath.value.value)
    })
  
  return ast.toSource({ quote })
}