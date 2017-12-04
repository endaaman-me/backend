const jwt = require('jsonwebtoken')
const util = require('util')
const config = require('../config')

const jwtVerify = util.promisify(jwt.verify)

module.exports = async (ctx, next) => {
  const token = ctx.token
  if (!token) {
    await next()
    return
  }
  try {
    const decoded = await jwtVerify(token, config.SECRET_KEY_BASE)
  }
  catch (e) {
    ctx.body = e
    await next()
    return
  }

  ctx.authorized = true
  await next()
}
