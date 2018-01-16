const pa = require('path')
const fs = require('fs-extra')
const fecha = require('fecha')
const yaml = require('js-yaml')

const { ARTICLES_DIR, META_DELIMITTER } = require('../../../config')
const { Article } = require('../model')
const { setWarningsByKey } = require('../../../infras/warning')


const MARKDONW_FILE_REG = /^.+\.md$/
const NG_FIELDS = ['slug', 'content']
const J = pa.join.bind(pa)

function isMd(name) {
  return MARKDONW_FILE_REG.test(name)
}

function trimExtension(s) {
  const i = s.lastIndexOf('.')
  return i < 0 ? s : s.substr(0, i)
}

function splitArticleText(wholeText) {
  const lines = wholeText.split('\n')
  const metaLines = []
  const contentLines = []

  let count = 0
  for (const line of lines) {
    if (line === META_DELIMITTER) {
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

async function readOne(filename, parent) {
  let err
  const path = J(ARTICLES_DIR, parent ? J(parent, filename) : filename)
  const slug = trimExtension(filename)

  const stat = await fs.stat(path)
  const wholeText = await fs.readFile(path, 'utf-8')
  const {
    metaText,
    contentText,
  } = splitArticleText(wholeText)

  let { meta, warning } = parseMetaText(metaText)

  if (NG_FIELDS.some((k) => k in meta)) {
    meta = {}
    warning = `You must not define ${JSON.stringify(NG_FIELDS)} in meta`
  }

  const base =  {
    slug,
    parent,
    content: contentText,
    date: fecha.format(stat.birthtime, 'YYYY-MM-DD'),
  }

  let article
  article = new Article({
    ...base,
    ...meta,
  })

  err = article.validate()
  if (err) {
    article = new Article(base)
    warning = err.message
  }
  article.bless(stat.birthtime, stat.mtime)

  return { article, warning }
}

async function readAll() {
  const baseFilenames = await fs.readdir(ARTICLES_DIR)

  const parents = (await Promise.all(baseFilenames.map(slug => {
    return fs.stat(J(ARTICLES_DIR, slug)).then((stat) => ({stat, slug}))
  })))
    .filter((v) => v.stat.isDirectory())
    .map((v) => v.slug)

  const wg = []
  for (const v of baseFilenames.filter(isMd)) {
    wg.push(readOne(v, null))
  }

  for (const parent of parents) {
    const filenames = (await fs.readdir(J(ARTICLES_DIR, parent))).filter(isMd)
    for (const name of filenames) {
      wg.push(readOne(name, parent))
    }
  }
  const results = await Promise.all(wg)

  const articles = []
  const warnings = []
  for (const result of results) {
    if (result.warning) {
      warnings.push({
        title: result.article.getSlug(),
        message: result.warning,
      })
    }
    articles.push(result.article)
  }

  await setWarningsByKey('articles', warnings)

  return articles
}

module.exports = {
  readAll,
}
