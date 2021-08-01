// reference  https://github.com/vuejs/vue/blob/0603ff695d2f41286239298210113cbe2b209e28/src/compiler/parser/text-parser.js


const jsParser = require('./jsParser')
const { isZh } = require('../utils')
const { i18nIdentifier } = require('../config.json')

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
// eslint-disable-next-line no-useless-escape
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
}

function textParser (content, delimiters) {
  let newContent = content.trim()
  return content.replace(newContent, `${delimiters[0]} ${i18nIdentifier}('${newContent}') ${delimiters[1]}`)
}

module.exports = (text, delimiters) => {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  if (!tagRE.test(text)) {
    return text
  }
  // const rawTokens = []
  let res = ''
  let lastIndex = tagRE.lastIndex = 0
  let match, index, textValue
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      // rawTokens.push(text.slice(lastIndex, index))
      textValue = text.slice(lastIndex, index)
      res += isZh(textValue) ? textParser(textValue, delimiters) : textValue
    }
    // tag token
    const exp = match[1] // parseFilters(match[1].trim())
    // rawTokens.push({ '@binding': exp })

    res += `${delimiters[0]} ${jsParser(exp)} ${delimiters[1]}`

    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    textValue = text.slice(lastIndex)
    res += isZh(textValue) ? textParser(textValue, delimiters) : textValue
  }
  return res
}

