const fs = require('fs-extra')
const config = require('../config')


module.exports = async (ctx, next) => {
  await fs.ensureDir(config.ARTICLES_DIR)
  await fs.ensureDir(config.PRIVATE_DIR)
  await next()
}
