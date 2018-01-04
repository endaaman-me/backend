const Router = require('koa-router')
const { getAllWarning } = require('../infras/warning')


const router = new Router()

router.get('/warning', async (ctx, next) => {
  ctx.body = await getAllWarning()
})

module.exports = router
