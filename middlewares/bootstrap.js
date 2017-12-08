const { bootstrap } = require('../handlers/bootstrap')

module.exports = async (ctx, next) => {
  await bootstrap()
  await next()
}
