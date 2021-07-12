const fs = require('fs')
const path = require('path')  //解析需要遍历的文件夹

const readFile = function (dirPath, callBack) {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error(err)
    } else {
      files.forEach(filename => {
        const filedir = path.join(dirPath, filename)
        // 根据文件路径获取文件信息
        fs.stat(filedir, (eror, stats) => {
          if (eror) {
            console.error('获取文件 stats 失败')
          } else {
            const isFile = stats.isFile()
            const isDir = stats.isDirectory()
            if (isFile) {
              const content = fs.readFileSync(filedir, 'utf-8')
              const type = path.extname(filedir).replace('.', '')
              callBack({ type, content })
            }
            if (isDir) {
              readFile(filedir, callBack)
            }
          }
        })
      })
    }
  })
}

const readHtmlNode = function (ast = [], callBack) {
  ast.forEach(node => {
    callBack(node)
    if (node.children && node.children.length) {
      readHtmlNode(node.children, callBack)
    }
  })
}

const readTagAttrs = function (attrs = {}, callBack) {
  Object.keys(attrs).forEach(key => {
    callBack(key, attrs[key])
  })
}

const isZh = text => {
  const zhRegExp = new RegExp('[\\u4E00-\\u9FFF]+', 'g')
  return zhRegExp.test(text)
}

exports.readFile = readFile
exports.isZh = isZh
exports.readHtmlNode = readHtmlNode
exports.readTagAttrs = readTagAttrs