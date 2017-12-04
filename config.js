const path = require('path')
const bcrypt = require('bcrypt')
const crypto = require('crypto')


const SHARED_DIR = process.env.ENDAAMAN_SHARED_DIR || path.join(process.cwd(), 'shared')
const ARTICLES_DIR = path.join(SHARED_DIR, 'articles')

const PRIVATE_DIR_NAME = 'private'
const PRIVATE_DIR = path.join(SHARED_DIR, PRIVATE_DIR_NAME)

const PASSWORD_HASH = process.env.ENDAAMAN_PASSWORD || bcrypt.hashSync('hogehoge', bcrypt.genSaltSync(10))
const SECRET_KEY_BASE = process.env.SECRET_KEY_BASE || crypto.randomBytes(48).toString('hex')

module.exports = {
  SHARED_DIR,
  PRIVATE_DIR_NAME,
  PRIVATE_DIR,
  ARTICLES_DIR,
  PASSWORD_HASH,
  SECRET_KEY_BASE
}
