const koaLogger = require('koa-logger')
const config = require('../config')

module.exports = async (ctx, next) => {
  await koaLogger()(ctx, next)
}
