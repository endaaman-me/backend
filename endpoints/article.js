const Router = require('koa-router')
const Joi = require('joi')
const config = require('../config')
const {
  Article,
  storeArticle,
  dropArticle,
  findAllArticles,
  findArticleByRelative,
} = require('../domains/article')


const router = new Router()

async function retrieveArticle(ctx) {
  const { parent, slug } = ctx.params
  const relative = parent === '-' ? slug : `${parent}/${slug}`
  return await findArticleByRelative(relative)
}


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

router.get('/:parent/:slug', async (ctx, next) => {
  const a= await retrieveArticle(ctx)
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
  ctx.body = await findArticleByRelative(article.getRelative())
  ctx.status = 201
})

router.patch('/:parent/:slug', async (ctx, next) => {
  let err
  let article = await retrieveArticle(ctx)
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
  ctx.body = await findArticleByRelative(article.getRelative())
})

router.delete('/:parent/:slug', async (ctx, next) => {
  let err
  const article = await retrieveArticle(ctx)
  if (!article) {
    ctx.throw(404)
    return
  }

  await dropArticle(article)
  ctx.status = 204
})


module.exports = router
