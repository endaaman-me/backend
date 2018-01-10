const { getCacheByKey, setCacheByKey, checkUpgradeNeededByKey } = require('../../infras/cache')
const { readAll, write, removeBySlug } = require('./io')
const { Article } = require('./model')


const KEY_CACHE = 'ARTICLES'

async function upgradeCache() {
  if (!await checkUpgradeNeededByKey(KEY_CACHE)) {
    return
  }
  const items = await readAll()
  items.sort((a, b) => a.compare(b)) // reversed
  await setCacheByKey(KEY_CACHE, items)
}

async function store(item) {
  await write(item)
}

async function drop(item) {
  await removeBySlug(item.getSlug())
}

async function findAll(func) {
  await upgradeCache()
  const items = await getCacheByKey(KEY_CACHE)
  return func
    ? items.filter(func)
    : items
}

async function find(func) {
  const items = await findAll()
  return items.find(func) || null
}

module.exports = {
  store,
  drop,
  findAll,
  find,
}
