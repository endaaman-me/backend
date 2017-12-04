module.exports = async function(ctx, next) {
  if (!ctx.authorized) {
    ctx.throw(403)
    return
  }
  await next()
}
