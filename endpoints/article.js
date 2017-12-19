const Router = require('koa-router')
const Joi = require('joi')
const config = require('../config')
const { wrapp } = require('../lib')
const { Article, validateArticle } = require('../domains/article')
const { saveArticle, getArticles, getArticleBySlug } = require('../applications/handler')


const router = new Router()

router.get('/', async (ctx, next) => {
  const allArticles = await getArticles()

  const articles = ctx.authorized
    ? allArticles
    : allArticles.filter((a) => !a.isPrivate())

  articles.sort((a, b) => {
    return (new Date(b.date)).getTime() - (new Date(a.date)).getTime()
  })
  ctx.body = articles
})

router.post('/', async (ctx, next) => {
  let err

  const article = new Article(ctx.request.body)
  err = validateArticle(article)
  if (err) {
    ctx.throw(400, err.message)
    return
  }

  [ err ] = await saveArticle(article)
  if (err) {
    ctx.throw(400, e.message)
    return
  }
  ctx.body = await getArticleBySlug(article.slug)
  ctx.status = 201
})

router.patch('/:slug*', async (ctx, next) => {
  let err
  const { slug } = ctx.params
  const article = await getArticleBySlug(slug)
  if (!article) {
    ctx.throw(404)
    return
  }

  article.extend(ctx.request.body)
  err = validateArticle(article)
  if (err) {
    ctx.throw(400, err.message)
    return
  }

  [ err ] = await saveArticle(article)
  if (err) {
    ctx.throw(400, err.message)
    return
  }

  ctx.body = await getArticleBySlug(article.slug)
  ctx.status = 201
})

router.delete('/:slug*', async (ctx, next) => {
  let err
  const { slug } = ctx.params
  const article = await getArticleBySlug(slug)

  if (!article) {
    ctx.throw(404)
    return
  }

  [ err ] = await deleteArticle(article)
  if (err) {
    ctx.throw(400, err.message)
    return
  }
  ctx.status = 204
})


module.exports = router
