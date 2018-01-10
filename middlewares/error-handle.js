const { ResumableError } = require('../helper')

module.exports = async function(ctx, next) {
  try {
    await next()
  } catch (e) {
    if (e instanceof ResumableError) {
      ctx.body = e.message
      // ctx.app.emit('error', e, ctx)
      ctx.status = 400
      return
    }
    throw e
  }
}
