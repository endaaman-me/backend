const { getCacheByKey, setCacheByKey, checkUpgradeNeededByKey } = require('../../infras/cache')
const { write, readAll, remove } = require('./io')
const { Category } = require('./model')


const KEY_CACHE = 'CATEGORIES'

async function upgradeCache() {
  if (!await checkUpgradeNeededByKey(KEY_CACHE)) {
    return
  }
  const items = await readAll()
  items.sort((a, b) => a.compare(b))
  await setCacheByKey(KEY_CACHE, items)
}

async function store(item) {
  await write(item)
}

async function drop(item) {
  await remove(item)
}

async function findAll(q) {
  await upgradeCache()
  const items = await getCacheByKey(KEY_CACHE)
  return q
    ? items.filter(q)
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
