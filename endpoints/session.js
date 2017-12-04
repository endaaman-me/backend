const util = require('util')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Router = require('koa-router')
const config = require('../config')

const router = new Router()

const bcryptCompare = util.promisify(bcrypt.compare.bind(bcrypt))
const jwtVerify = util.promisify(jwt.verify)

router.post('/', async (ctx, next) => {
  const password = ctx.request.body.password
  if (!password) {
    ctx.throw(401)
    return
  }

  const ok = await bcryptCompare(password, config.PASSWORD_HASH)
  if (!ok) {
    ctx.throw(401)
    return
  }

  const token = jwt.sign({authorized: true}, config.SECRET_KEY_BASE)
  ctx.body = { token }
  ctx.status = 201
})

router.get('/', async (ctx, next) => {
  if (ctx.authorized) {
    ctx.status = 204
  } else {
    ctx.status = 401
  }

})

module.exports = router
