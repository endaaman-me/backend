const pa = require('path')
const fs = require('fs-extra')

const { ResumableError } = require('../../../helper')
const { ARTICLES_DIR } = require('../../../config')


function convertRelativeToAbs(relative) {
  if (!relative) {
    return null
  }
  return pa.join(ARTICLES_DIR, relative + '.md')
}


async function removeDirIfEmpty(path) {
  if (!fs.existsSync(path)) {
    return
  }
  const stat = await fs.stat(path)
  if (!stat.isDirectory()) {
    return
  }
  const files = await fs.readdir(path)
  if (files.length > 0) {
    return
  }
  await fs.rmdir(path)
}

async function write(article) {
  const newPath = convertRelativeToAbs(article.getRelative())
  const oldPath = convertRelativeToAbs(article.getOldRelative())

  if (article.isNewely()) {
    // newly create
    if (fs.existsSync(newPath)) {
      throw new ResumableError(`slug: \`${article.getSlug()}\` is duplicated`)
      return
    }
  } else {
    // update
    if (!fs.existsSync(oldPath)) {
      throw new ResumableError(`old slug: \`${article.getSlug()}\` does noe exist`)
      return
    }

    if (newPath !== oldPath) {
      if (fs.existsSync(newPath)) {
        throw new ResumableError(`slug: \`${article.getSlug()}\` is duplicated`)
        return
      }
      await fs.move(oldPath, newPath)
      const oldParent = article.getOldParent()
      if (oldParent) {
        await removeDirIfEmpty(pa.join(ARTICLES_DIR, oldParent))
      }
    }
  }

  await fs.ensureFile(newPath) // if category dir is not created
  await fs.writeFile(newPath, article.toText())

  const stat = await fs.stat(newPath)
  article.bless(stat.birthtime, stat.mtime)
}

async function remove(article) {
  const path = convertRelativeToAbs(article.getRelative())
  if (!fs.existsSync(path)) {
    throw new ResumableError(`can not unlink \`${path}\``)
    return
  }
  await fs.unlink(path)
  const parent = article.getParent()
  if (parent) {
    await removeDirIfEmpty(pa.join(ARTICLES_DIR, parent))
  }
}

module.exports = {
  write,
  remove,
}
