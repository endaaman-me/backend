const { bootstrap } = require('../applications/handler')

module.exports = async (ctx, next) => {
  await bootstrap()
  await next()
}
