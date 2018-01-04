const { ResumableError } = require('../helper')

module.exports = async function(ctx, next) {
  try {
    await next()
  } catch (err) {
    if (e instanceof ResumableError) {
      ctx.body = e.message
      ctx.app.emit('error', e, ctx);
      ctx.status = 400;
    }
    throw e
  }
}
