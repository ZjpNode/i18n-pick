// const jsParse = require('./jsParse')
// const vueParse = require('./vueParse')

function getParse (type) {
  try {
    return require(`./${type}Parser`)
  } catch (error) {
    return content => {
      console.warn(`暂不支持解析${type}文件`)
      return content
    }
  }
}

const parseFile = (type, cotent) => {
  const parseHandle = getParse(type)
  return parseHandle(cotent)
}

exports.parseFile = parseFile