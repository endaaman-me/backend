const Router = require('koa-router')
const Joi = require('joi')
const config = require('../config')
const { Category } = require('../domains/category')
const {
  getCategories,
} = require('../domains/category')


const router = new Router()

router.get('/', async (ctx, next) => {
  ctx.body = await getCategories()
})

module.exports = router
