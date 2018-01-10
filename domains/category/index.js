const { Category } = require('./model')
const { findAll, find, store, drop } = require('./repository')


async function findAllCategories(q) {
  return await findAll(q)
}

async function findCategoryBySlug(slug) {
  return await find((c) => slug === c.getSlug())
}

async function storeCategory(category) {
  return await store(category)
}

async function dropCategory(category) {
  return await drop(category)
}

module.exports = {
  Category,
  findAllCategories,
  findCategoryBySlug,
  storeCategory,
  dropCategory,
}
