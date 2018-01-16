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

async function findArticleByRelative(relative) {
  return await find((a) => relative === a.getRelative())
}

module.exports = {
  Article,
  storeArticle,
  dropArticle,
  findAllArticles,
  findArticleByRelative,
  ...constant,
}
