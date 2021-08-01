const compiler = require('vue-template-compiler')
// const domCompiler = require('@vue/compiler-dom')
const htmlParse = require('./htmlParse')
const jsParser = require('./jsParser')

// const { runTransformation } = require('vue-codemod')

module.exports = content => {

  // const result = runTransformation({ source: content, path:'tmp/a.vue' }, (file, api, options) => {
  //   console.log((file, api, options))
  // })
  // console.log(result)

  // compiler.compile
  const sfcDescriptor = compiler.parseComponent(content)
  const { template, styles, script } =sfcDescriptor
  const templateContent = htmlParse(template.content)
  let templateAttrs = ''
  Object.keys(template.attrs).forEach(key => {
    templateAttrs +=` ${key}="${template.attrs[key]}"`
  })
  const scriptContent = jsParser(script.content, { isVueScript: true })
  let scriptAttrs = ''
  Object.keys(script.attrs).forEach(key => {
    scriptAttrs +=` ${key}="${script.attrs[key]}"`
  })
  let stylesContent = ''
  styles.forEach(ele => {
    let styleAttrs = ''
    Object.keys(ele.attrs).forEach(key => {
      styleAttrs +=` ${key}="${ele.attrs[key]}"`
    })
    stylesContent +=`\n<style ${styleAttrs}>${ele.content}</style>`
  })
  // console.log(`<template ${templateAttrs}>${templateContent}</template>\n<script ${scriptAttrs}>${scriptContent}</script>${stylesContent}\n`)
  return `<template ${templateAttrs}>${templateContent}</template>\n<script ${scriptAttrs}>${scriptContent}</script>${stylesContent}\n`
}