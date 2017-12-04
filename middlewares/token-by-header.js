module.exports = async (ctx, next) => {
  const authStyle = 'Bearer'
  if (!ctx.request.header.authorization) {
    await next()
    return
  }

  const parts = ctx.request.header.authorization.split(' ')
  const validTokenStyle = parts.length === 2 && parts[0] === authStyle
  if (!validTokenStyle) {
    await next()
    return
  }
  ctx.token = parts[1]
  await next()
}
