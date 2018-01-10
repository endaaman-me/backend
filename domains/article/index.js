const { Article } = require('./model')
const { store, drop, findAll, find } = require('./repository')
const constant = require('./constant')


async function storeArticle(article) {
  await store(article)
}

async function dropArticle(article) {
  await drop(article)
}

async function findAllArticles(filter) {
  return await findAll(filter)
}

async function findArticleBySlug(slug) {
  return await find((a) => slug === a.getSlug())
}

module.exports = {
  Article,
  storeArticle,
  dropArticle,
  findAllArticles,
  findArticleBySlug,
  ...constant,
}
