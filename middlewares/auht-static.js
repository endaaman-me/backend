const config = require('../config')

module.exports = async (ctx, next) => {
  // ctx.body = 'hi'
  const splitted = ctx.path.split('/')
  if (ctx.path.startsWith('/' + config.PRIVATE_DIR_NAME)) {
    if (ctx.authorized) {
      await next()
    } else {
      ctx.throw(403)
    }
    return
  }
  await next()
}
