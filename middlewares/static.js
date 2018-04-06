const koaServe = require('koa-static')
const koaProxy = require('koa-proxies')
const config = require('../config')

const serve = koaServe(config.SHARED_DIR, {
  hidden: true,
})
const proxy = koaProxy('*', {
  target: 'http://localhost:3003', // internal static serving nginx
})


const PROTECTED_DIR_NAMES = ['articles', 'private']

module.exports = async (ctx, next) => {
  const goNext = async () => {
    if (config.IS_PROD) {
      await proxy(ctx, next)
    } else {
      await serve(ctx, next)
    }
  }

  const splitted = ctx.path.split('/')
  if (PROTECTED_DIR_NAMES.some(dir => ctx.path.startsWith('/' + dir) )) {
    if (ctx.authorized) {
      await goNext()
    } else {
      ctx.throw(403)
    }
    return
  }
  await goNext()
}
