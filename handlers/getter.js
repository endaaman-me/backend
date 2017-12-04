const {
  upgradeCache,
  getCache,
} = require('../services/cache')


async function getArticles() {
  await upgradeCache()
  return getCache().articles
}

async function getArticleBySlug(slug) {
  const articles = await getArticles()
  return articles.find((a) => a.slug === slug)
}

async function getCategories() {
  await upgradeCache()
  return getCache().categories
}

module.exports = {
  getArticles,
  getArticleBySlug,
  getCategories,
}
