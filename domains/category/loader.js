const pa = require('path')
const fs = require('fs-extra')
const fecha = require('fecha')
const yaml = require('js-yaml')
const Joi = require('joi')
const { META_FILENAME } = require('../../config')
const { Category } = require('./model')


const NG_FIELDS = ['slug']

const J = pa.join.bind(pa)
const BASE_DIR = config.ARTICLES_DIR

async function readOne(slug) {
  const category = new Category(slug, slug)
  const path = J(BASE_DIR, slug, META_FILENAME)

  if (!fs.existsSync(path)) {
    return { category, warning: null }
  }

  let meta = null
  const wholeText = await fs.readFile(path, 'utf-8')
  try {
    meta = JSON.parse(wholeText)
  } catch (e) {
    return { category, warning: e.toString() }
  }

  if (NG_FIELDS.some((k) => k in meta)) {
    return { category, warning: `${NG_FIELDS} is defined in meta` }
  }

  const testCategory = category.copy().extend(meta)
  if (!testCategory.validate()) {
    return { category, warning: testCategory.getError() }
  }

  return {
    category: testCategory,
    warning: null,
  }
}

async function readAll() {
  const baseFilenames = await fs.readdir(BASE_DIR)

  const categortSlugs = (await Promise.all(baseFilenames.map(slug => {
    return fs.stat(J(BASE_DIR, slug)).then((stat) => ({stat, slug}))
  })))
    .filter((v) => v.stat.isDirectory())
    .map((v) => v.slug)

  const wg = []
  for (const categorySlug of categortSlugs) {
    wg.push(loadCategory(J(categorySlug)))
  }
  const results = await Promise.all(wg)

  const categories = []
  const warnings = []
  results.forEach((result) => {
    if (result.warning) {
      warnings.push({
        slug: result.category.slug,
        warning: result.warning,
      })
    }
    categories.push(result.category)
  })

  return { categories, warnings }
}

module.exports = {
  loadCategories
}
