const pa = require('path')
const fs = require('fs-extra')

const { ResumableError } = require('../../../helper')
const { ARTICLES_DIR, META_FILENAME } = require('../../../config')


const J = pa.join.bind(pa)

async function write(category) {
  const slug = category.getSlug()
  const dirPath = J(ARTICLES_DIR, slug)
  const metaPath = J(dirPath, META_FILENAME)

  if (category.isNewely()) {
    if (fs.existsSync(metaPath)) {
      throw new ResumableError(`category: "${metaPath}" is already created`)
      return
    }
    if (fs.existsSync(dirPath)) {
      throw new ResumableError(`"${dirPath}" is already taken by article or category`)
      return
    }
  }

  await fs.ensureFile(metaPath)
  await fs.writeFile(metaPath, category.toText())
}

async function removeBySlug(slug) {
  // can delete only when the directory is empty or '.meta.json' only

  const dirPath = J(ARTICLES_DIR, slug)

  if (!fs.existsSync(dirPath)) {
    throw new ResumableError(`category: "${dirPath}" is already created`)
    return
  }

  const files = (await fs.readdir(dirPath)).filter((f) => f !== META_FILENAME)
  if (files.length > 0) {
    throw new ResumableError(`there are some articles related the category`)
    return
  }
  await fs.remove(dirPath)
}

module.exports = {
  write,
  removeBySlug,
}
