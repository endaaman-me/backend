module.exports = async (ctx, next) => {
  ctx.token = ctx.cookies.get('token')
  await next()
}
