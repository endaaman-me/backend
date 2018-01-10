const pa = require('path')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')

dotenv.config()

if (!process.env.ENDAAMAN_SECRET_KEY_BAE) {
  throw new Error('You need to setup .env')
  return
}

const PASSWORD_HASH = process.env.ENDAAMAN_PASSWORD_HASH
const SECRET_KEY_BASE = process.env.ENDAAMAN_SECRET_KEY_BAE

const SHARED_DIR = pa.resolve(process.env.ENDAAMAN_SHARED_DIR)
const ARTICLES_DIR = pa.join(SHARED_DIR, 'articles')
const PRIVATE_DIR = pa.join(SHARED_DIR, 'private')
const PROTECTED_DIR_NAMES = ['articles', 'private']


const META_DELIMITTER = '---'
const META_FILENAME = '.meta.json'
const WARNING_FILE_NAME = '.warning.json'
const CACHE_IGONRED_FILES = [WARNING_FILE_NAME]

module.exports = {
  PASSWORD_HASH,
  SECRET_KEY_BASE,

  SHARED_DIR,
  PRIVATE_DIR,
  ARTICLES_DIR,
  PROTECTED_DIR_NAMES,

  META_DELIMITTER,
  META_FILENAME,
  WARNING_FILE_NAME,
  CACHE_IGONRED_FILES,
}
