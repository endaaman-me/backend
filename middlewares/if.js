module.exports = function(middleware, condition = true) {
  return async (ctx, next) => {
    if (condition) {
      await middleware(ctx, next)
    } else {
      await next()
    }
  }
}
