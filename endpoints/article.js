const Router = require('koa-router')
const Joi = require('joi')
const config = require('../config')
const {
  Article,
  storeArticle,
  dropArticle,
  findAllArticles,
  findArticleBySlug,
} = require('../domains/article')


const router = new Router()


function combineFilters(filters) {
  return function(a) {
    for (const filter of filters) {
      if (!filter(a)) {
        return false
      }
    }
    return true
  }
}

router.get('/', async (ctx, next) => {
  const filters = []
  if (!ctx.authorized) {
    filters.push((a) => a.isPublic())
  }

  let q
  if (q = ctx.query.category || ctx.query.cat) {
    filters.push((a) => a.getCategorySlug() === q)
  }
  ctx.body = await findAllArticles(combineFilters(filters))
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

  await storeArticle(article)
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

  article = article.extend(ctx.request.body)
  err = article.validate()
  if (err) {
    ctx.throw(400, err.message)
    return
  }

  await storeArticle(article)
  ctx.body = await findArticleBySlug(article.getSlug())
})

router.delete('/:slug*', async (ctx, next) => {
  let err
  const article = await findArticleBySlug(ctx.params.slug)

  if (!article) {
    ctx.throw(404)
    return
  }

  await dropArticle(article)
  ctx.status = 204
})


module.exports = router
