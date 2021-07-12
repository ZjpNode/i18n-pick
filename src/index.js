const { program } = require('commander')
const { version } = require('../package.json')
const { readFile } = require('./utils')
const { parseFile } = require('./parse/index')
const argv = process.argv

program
    .version(version)
    .parse(argv)

readFile('./template', ({ type, content }) => {
    parseFile(type, content)
})