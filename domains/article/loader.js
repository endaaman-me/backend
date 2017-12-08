const pa = require('path')
const fs = require('fs-extra')
const fecha = require('fecha')
const yaml = require('js-yaml')
const Joi = require('joi')
const config = require('../../config')
const { Article } = require('./model')


const MARKDONW_FILE_REG = /^.+\.md$/
const NG_FIELDS = ['slug', 'content']
const BASE_DIR = config.ARTICLES_DIR

const J = pa.join.bind(pa)

function trimExtension(s) {
  const i = s.lastIndexOf('.')
  return i < 0 ? s : s.substr(0, i)
}


function splitArticleText(wholeText) {
  const lines = wholeText.split('\n')
  let count = 0
  const metaLines = []
  const contentLines = []
  for (const line of lines) {
    if (line === Article.META_DELIMITTER) {
      count += 1
      continue
    }
    if (count === 1) {
      metaLines.push(line)
      continue
    }
    contentLines.push(line)
  }
  const metaText = metaLines.join('\n')
  const contentText = contentLines.join('\n')
  return {
    metaText,
    contentText,
  }
}


function parseMetaText(metaText) {
  if (!metaText) {
    return {
      warning: null,
      meta: {},
    }
  }

  let meta = null
  try {
    meta = yaml.safeLoad(metaText)
  } catch (e) {
    return {
      warning: e,
      meta: {},
    }
  }

  if (!meta instanceof Object) {
    return {
      warning: 'meta data is not object',
      meta: {},
    }
  }

  return {
    warning: null,
    meta,
  }
}

async function loadArticle(relative) {
  const filepath = J(BASE_DIR, relative)

  const stat = await fs.stat(filepath)

  const splitted = relative.split('/')

  const slug = trimExtension(relative)
  const wholeText = await fs.readFile(filepath, 'utf-8')
  const {
    metaText,
    contentText,
  } = splitArticleText(wholeText)

  let { meta, warning } = parseMetaText(metaText)

  const article = new Article(slug, contentText)

  if (NG_FIELDS.some((k) => k in meta)) {
    return { article, warning: `${JSON.stringify(NG_FIELDS)} is defined in meta` }
  }

  article.extend({
    date: fecha.format(stat.mtime, 'YYYY-MM-DD'),
    created_at: stat.birthtime,
    updated_at: stat.mtime,
  })

  const testArticle = article.copy().extend(meta)
  if (!testArticle.validate()) {
    return { article, warning: testArticle.getError() }
  }
  return { article: testArticle, warning: null }
}

async function loadArticles() {
  const baseFilenames = await fs.readdir(BASE_DIR)

  const categortSlugs = (await Promise.all(baseFilenames.map(slug => {
    return fs.stat(J(BASE_DIR, slug)).then((stat) => ({stat, slug}))
  })))
    .filter((v) => v.stat.isDirectory())
    .map((v) => v.slug)

  const wg = []
  baseFilenames
    .filter(name => MARKDONW_FILE_REG.test(name))
    .forEach((v) => {
      wg.push(loadArticle(v, null))
    })

  for (const categorySlug of categortSlugs) {
    (await fs.readdir(J(BASE_DIR, categorySlug)))
      .filter(name => MARKDONW_FILE_REG.test(name))
      .forEach((name) => {
        wg.push(loadArticle(J(categorySlug, name)))
      })
  }
  const results = await Promise.all(wg)

  const articles = []
  const warnings = []
  results.forEach((result) => {
    if (result.warning) {
      warnings.push({
        slug: result.article.slug,
        warning: result.warning,
      })
    }
    articles.push(result.article)
  })

  return { articles, warnings }
}

module.exports = {
  loadArticles
}
