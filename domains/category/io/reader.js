const pa = require('path')
const fs = require('fs-extra')

const { ARTICLES_DIR, META_FILENAME } = require('../../../config')
const { Category } = require('../model')
const { setWarningsByKey } = require('../../../infras/warning')


const NG_FIELDS = ['slug']
const J = pa.join.bind(pa)

async function readPre(slug) {
  const path = J(ARTICLES_DIR, slug, META_FILENAME)

  const data = { slug }
  const category = new Category(data)

  if (!fs.existsSync(path)) {
    return { category, warning: null, }
  }

  let meta
  const text = await fs.readFile(path, 'utf-8')
  try {
    meta = JSON.parse(text)
  } catch (e) {
    return { category, warning: e.message, }
  }

  if (NG_FIELDS.some((k) => k in meta)) {
    return { category, warning: `${NG_FIELDS} is defined in meta` }
  }

  const newCategory = new Category({ ...data, ...meta })
  const err = newCategory.validate()
  if (err) {
    return { category, warning: err.message }
  }

  return {
    category: newCategory,
    warning: null,
  }
}


async function readOne(slug) {
  const result = await readPre(slug)
  result.category.bless()
  return result
}


async function readAll() {

  const baseFilenames = await fs.readdir(ARTICLES_DIR)

  const categortSlugs = (await Promise.all(baseFilenames.map(slug => {
    return fs.stat(J(ARTICLES_DIR, slug)).then((stat) => ({stat, slug}))
  })))
    .filter((v) => v.stat.isDirectory())
    .map((v) => v.slug)

  const wg = []
  for (const categorySlug of categortSlugs) {
    wg.push(readOne(categorySlug))
  }
  const results = await Promise.all(wg)

  const categories = []
  const warnings = []
  for (const result of results) {
    if (result.warning) {
      warnings.push({
        title: result.category.getSlug(),
        message: result.warning,
      })
    }
    categories.push(result.category)
  }

  await setWarningsByKey('categories', warnings)

  return categories
}

module.exports = {
  readAll,
}
