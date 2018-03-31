const pa = require('path')
const bcrypt = require('bcrypt')

const SHARED_DIR = pa.resolve(process.env.SHARED_DIR)

const config = {
  IS_PROD           : process.env.NODE_ENV === 'production',
  SECRET_KEY_BASE   : process.env.SECRET_KEY_BASE,
  PASSWORD_HASH     : process.env.PASSWORD_HASH,
  SHARED_DIR,
  PRIVATE_DIR       : pa.join(SHARED_DIR, 'private'),
  ARTICLES_DIR      : pa.join(SHARED_DIR, 'articles'),
  META_DELIMITTER   : '---',
  META_FILENAME     : '.meta.json',
  WARNING_FILE_NAME : '.warning.json',
}

for (const k in config) {
  if (config[k] == null) {
    throw new Error(`App could not be started because ${ k } is not define.`)
  }
}

module.exports = config
