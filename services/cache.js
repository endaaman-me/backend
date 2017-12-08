const pa = require('path')
const fs = require('fs-extra')
const config = require('../config')

const { loadArticles } = require('../domains/article')
const { loadCategories } = require('../domains/category')

let CACHE_DATA = {
  articles: null,
  categories: null,
}
let CACHE_REVISION = 0

const WARNING_FILE_NAME = '.warning.json'

async function getCurrentRevision() {
  const DIR = config.ARTICLES_DIR
  const paths = (await fs.readdir(DIR))
    .filter((f) => f !== WARNING_FILE_NAME)
    .map((f) => pa.join(DIR, f))
  if (paths.length === 0) {
    return (new Date()).getTime()
  }
  const mtimes = (await Promise.all(paths.map((p) => fs.stat(p))))
    .map((s) => s.mtime.getTime())
  return mtimes.reduce((prev, cur) => prev > cur ? prev : cur)
}

async function isUpgradeNeeded(data, changedAt) {
  if (!CACHE_REVISION) {
    return true
  }
  const currentRevision = await getCurrentRevision()
  return currentRevision > CACHE_REVISION
}

async function upgradeCache() {
  if (!await isUpgradeNeeded()) {
    return
  }
  console.log('upgrade cache')

  const { articles, warnings: articleWarnings } = await loadArticles()
  const { categories, warnings: categoryWarnings } = await loadCategories()

  CACHE_DATA.articles = articles
  CACHE_DATA.categories = categories
  CACHE_REVISION = await getCurrentRevision()

  const warningFilePath = pa.join(config.ARTICLES_DIR, WARNING_FILE_NAME)

  const warning = {
    articles: articleWarnings,
    categories: categoryWarnings,
  }

  await fs.writeFile(warningFilePath, JSON.stringify(warning, null, 2))
}

function getCache(data, changedAt) {
  return CACHE_DATA
}

module.exports = {
  upgradeCache,
  getCache,
}
