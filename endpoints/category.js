const Router = require('koa-router')
const Joi = require('joi')
const config = require('../config')
const { Category } = require('../domains/category')
const {
  findAllCategories,
  findCategoryBySlug,
  storeCategory,
  dropCategory,
} = require('../domains/category')


const router = new Router()

router.get('/', async (ctx, next) => {
  ctx.body = await findAllCategories()
})

router.post('/', async (ctx, next) => {
  let err

  const category = new Category(ctx.request.body)
  err = category.validate()
  if (err) {
    ctx.throw(400, err.message)
    return
  }

  await storeCategory(category)
  ctx.body = await findCategoryBySlug(category.getSlug())
  ctx.status = 201
})

router.patch('/:slug*', async (ctx, next) => {
  let err

  const { slug } = ctx.params
  let category = await findCategoryBySlug(slug)
  if (!category) {
    ctx.throw(404)
    return
  }

  category = category.extend(ctx.request.body)
  err = category.validate()
  if (err) {
    ctx.throw(400, err.message)
    return
  }

  await storeCategory(category)
  ctx.body = await findCategoryBySlug(category.getSlug())
})

router.delete('/:slug*', async (ctx, next) => {
  let err
  const category = await findCategoryBySlug(ctx.params.slug)

  if (!category) {
    ctx.throw(404)
    return
  }

  await dropCategory(category)
  ctx.status = 204
})

module.exports = router
