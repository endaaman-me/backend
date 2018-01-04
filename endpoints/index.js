const KoaRouter = require('koa-router')

const sessionRouter = require('./session')
const articleRouter = require('./article')
const categoryRouter = require('./category')
const fileRouter = require('./file')
const miscRouter = require('./misc')


const router = new KoaRouter()
router
  .use('/sessions', sessionRouter.routes(), sessionRouter.allowedMethods())
  .use('/articles', articleRouter.routes(), articleRouter.allowedMethods())
  .use('/categories', categoryRouter.routes(), categoryRouter.allowedMethods())
  .use('/files', fileRouter.routes(), fileRouter.allowedMethods())
  .use('/misc', miscRouter.routes(), miscRouter.allowedMethods())
  .get('/', (ctx) => {
    ctx.body = { message: 'Hi, this is endaaman\' api server' }
  })

module.exports = router
