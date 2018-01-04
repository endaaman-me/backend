const { Category } = require('./model')
const { findAll } = require('./repository')


async function findAllCategories() {
  return await findAll()
}

module.exports = {
  Category,
  findAllCategories,
}
