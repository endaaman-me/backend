const Koa = require('koa')
const KoaRouter = require('koa-router')
const koaJson = require('koa-json')
const koaBody = require('koa-bodyparser')
const koaLogger = require('koa-logger')
const koaServe = require('koa-static')
const koaCors = require('@koa/cors');

const config = require('./config')
const bootstrapMiddleware = require('./middlewares/bootstrap')
const tokenByHeaderMiddleware = require('./middlewares/token-by-header')
const tokenByCookieMiddleware = require('./middlewares/token-by-cookie')
const loggerMiddleware = require('./middlewares/logger')
const authMiddleware = require('./middlewares/auth')
const authStaticMiddleware = require('./middlewares/auth-static')
const sessionRouter = require('./endpoints/session')
const articleRouter = require('./endpoints/article')
const categoryRouter = require('./endpoints/category')
const fileRouter = require('./endpoints/file')


const apiRouter = new KoaRouter()
apiRouter
  .use('/sessions', sessionRouter.routes(), sessionRouter.allowedMethods())
  .use('/articles', articleRouter.routes(), articleRouter.allowedMethods())
  .use('/categories', categoryRouter.routes(), categoryRouter.allowedMethods())
  .use('/files', fileRouter.routes(), fileRouter.allowedMethods())
  .get('/', (ctx) => {
    ctx.body = { message: 'Hi, this is endaaman\' api server' }
  })

const apiApp = new Koa()
apiApp.context.token = null
apiApp.context.authorized = false
apiApp
  .use(bootstrapMiddleware)
  .use(koaJson({pretty: false, param: 'pretty'}))
  .use(koaCors({
    origin: ['*'],
    allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'If-Modified-Since'],
  }))
  .use(koaBody())
  .use(loggerMiddleware)
  .use(tokenByHeaderMiddleware)
  .use(authMiddleware)
  .use(apiRouter.routes())
  .use(apiRouter.allowedMethods())
  .listen(3001)

const staticApp = new Koa()
staticApp.context.token = null
staticApp.context.authorized = false
staticApp
  .use(bootstrapMiddleware)
  .use(tokenByCookieMiddleware)
  .use(authMiddleware)
  .use(authStaticMiddleware)
  .use(koaServe(config.SHARED_DIR))
  .listen(3002)