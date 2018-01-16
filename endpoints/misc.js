const Router = require('koa-router')
const { getAllWarning } = require('../infras/warning')
const { getCacheData } = require('../infras/cache')


const router = new Router()

router.get('/warning', async (ctx, next) => {
  ctx.body = await getAllWarning()
})

router.get('/cache', async (ctx, next) => {
  ctx.body = getCacheData()
})

router.post('/echo', async (ctx, next) => {
  ctx.body = ctx.request.body
})

module.exports = router
