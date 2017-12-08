const fs = require('fs-extra')
const config = require('../config')

async function bootstrap() {
  await fs.ensureDir(config.ARTICLES_DIR)
  await fs.ensureDir(config.PRIVATE_DIR)
}

module.exports = {
  bootstrap,
}
