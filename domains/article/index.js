const { Article } = require('./model')
const { store, remove, find, findOne } = require('./repository')
const { validate } = require('./spec')

async function saveArticle(article) {
  await store(article)
}

async function deleteArticle(article) {
  await remove(article)
}

async function validateArticle(article) {
  return validate(article)
}


async function validateArticle(article) {
}

module.exports = {
  Article,
  saveArticle,
  deleteArticle,
  getArticles,
  getPublicArticles,
  getArticleBySlug,
}
