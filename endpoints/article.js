const Router = require('koa-router')
const Joi = require('joi')
const config = require('../config')
const { Article } = require('../domains/article')
const { getArticles, getArticleBySlug } = require('../handlers/getter')


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
  const req = ctx.request.body

  const article = new Article(req.slug || '', req.content)

  article.extend(req)
  article.validate()

  if (article.getError()) {
    ctx.body = article.getError()
    ctx.status = 400
    return
  }

  try {
    await article.create()
  } catch (e) {
    ctx.throw(400, e.message)
    return
  }
  ctx.body = await getArticleBySlug(article.slug)
  ctx.status = 201
})

router.patch('/:slug*', async (ctx, next) => {
  const req = ctx.request.body
  const { slug } = ctx.params
  const article = await getArticleBySlug(slug)

  if (!article) {
    ctx.throw(404)
    return
  }

  article.extend(req)

  if (!article.validate()) {
    ctx.body = article.getError()
    ctx.status = 400
    return
  }

  try {
    await article.update(slug)
  } catch (e) {
    ctx.throw(400, e.message)
    return
  }

  ctx.body = await getArticleBySlug(article.slug)
  ctx.status = 201
})

router.delete('/:slug*', async (ctx, next) => {
  const req = ctx.request.body
  const { slug } = ctx.params
  const article = await getArticleBySlug(slug)

  if (!article) {
    ctx.throw(404)
    return
  }

  await article.delete()
  ctx.status = 204
})


module.exports = router
