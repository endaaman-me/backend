const config = require('../config')

module.exports = async (ctx, next) => {
  // ctx.body = 'hi'
  const splitted = ctx.path.split('/')
  if (config.PROTECTED_DIR_NAMES.some(dir => {
    return ctx.path.startsWith('/' + dir)
  })) {
    if (ctx.authorized) {
      await next()
    } else {
      ctx.throw(403)
    }
    return
  }
  await next()
}
