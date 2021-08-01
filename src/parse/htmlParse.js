

const { readHtmlNode, readTagAttrs, isZh, } = require('../utils')
const { delimiters } = require('../config.json')
const jsParser = require('./jsParser')
const textParser = require('./textParser')
const html5parser = require('html-parse-stringify')

module.exports = (content) => {

  const ast = html5parser.parse(content)
  readHtmlNode(ast, node => {
    if (node.type === 'tag') {
      readTagAttrs(node.attrs, (attrKey, attrVal) => {
        if (isZh(attrVal)) {
          if (attrKey.indexOf('@') < 0 &&  attrKey.indexOf('v-') < 0) {
            attrVal = `"${attrVal}"`
          } 
          node.attrs[attrKey] = jsParser(attrVal) // `${i18nIdentifier}('${attrVal}')`
        }
      })
    }
    if (node.type === 'text' && isZh(node.content)) {

      node.content = textParser(node.content, delimiters)


      // newContent = content.replace(newContent, `${i18nIdentifier}('${newContent}')`)
      // node.content = newContent
      // console.log(node.content)
    }
  })

  console.log(html5parser.stringify(ast))

  return content
}