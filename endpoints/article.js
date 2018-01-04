const Router = require('koa-router')
const Joi = require('joi')
const config = require('../config')
const { wr } = require('../helper')
const {
  Article,
  storeArticle,
  dropArticle,
  findAllArticles,
  findArticleBySlug,
} = require('../domains/article')


const router = new Router()

router.get('/', async (ctx, next) => {
  const q = ctx.authorized
    ? null
    : (a) => a.isPublic()
  ctx.body = await findAllArticles(q)
})

router.get('/:slug', async (ctx, next) => {
  const a = await findArticleBySlug(ctx.params.slug)
  ctx.body = a
  ctx.status = a ? 200 : 404
})

router.post('/', async (ctx, next) => {
  let err

  const article = new Article(ctx.request.body)
  err = article.validate()
  if (err) {
    ctx.throw(400, err.message)
    return
  }

  [ err ] = await wr(storeArticle(article))
  if (err) {
    ctx.throw(400, err.message)
    return
  }
  ctx.body = await findArticleBySlug(article.getSlug())
  ctx.status = 201
})

router.patch('/:slug*', async (ctx, next) => {
  let err

  const { slug } = ctx.params
  let article = await findArticleBySlug(slug)
  if (!article) {
    ctx.throw(404)
    return
  }

  // article.extend(ctx.request.body)
  article = article.copy()
  article.extend(ctx.request.body)
  err = article.validate()
  if (err) {
    ctx.throw(400, err.message)
    return
  }

  [ err ] = await wr(storeArticle(article))
  if (err) {
    ctx.throw(400, err.message)
    return
  }

  ctx.body = await findArticleBySlug(article.getSlug())
})

router.delete('/:slug*', async (ctx, next) => {
  let err
  const article = await findArticleBySlug(ctx.params.slug)

  if (!article) {
    ctx.throw(404)
    return
  }

  [ err ] = await wr(dropArticle(article))
  if (err) {
    ctx.throw(400, err.message)
    return
  }
  ctx.status = 204
})


module.exports = router
