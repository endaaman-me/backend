const pa = require('path')
const fs = require('fs-extra')
const { WARNING_FILE_NAME, ARTICLES_DIR }  = require('../config')


const CACHE_IGONRED_FILES = [WARNING_FILE_NAME]
let CACHE_DATA = {}
let CACHE_REVISIONS = {}

const J = pa.join.bind(pa)

async function checkUpgradeNeededByKey(key) {
  const revision = CACHE_REVISIONS[key]
  if (!revision) {
    return true
  }

  const DIR = ARTICLES_DIR

  const paths = (await fs.readdir(DIR))
    .filter((f) => !CACHE_IGONRED_FILES.includes(f))
    .map((f) => J(DIR, f))

  paths.unshift(DIR)

  for (const path of paths) {
    const stat  = await fs.stat(path)
    if (stat.mtime.getTime() > revision) {
      return true
    }
    if (stat.isDirectory()) {
      const paths2 = (await fs.readdir(path)).map((f) => J(path, f))
      for (const path2 of paths2) {
        const stat2 = await fs.stat(path2)
        if (stat2.mtime.getTime() > revision) {
          return true
        }
      }
    }
  }
  return false
}

function getCacheByKey(key) {
  return CACHE_DATA[key]
}

function setCacheByKey(key, data) {
  CACHE_DATA = {
    ...CACHE_DATA,
    [key]: data,
  }
  CACHE_REVISIONS[key] = (new Date()).getTime()
}

function getCacheData(key) {
  return {
    data: CACHE_DATA,
    revisions: CACHE_REVISIONS,
  }
}

module.exports = {
  checkUpgradeNeededByKey,
  getCacheByKey,
  setCacheByKey,
  getCacheData,
}
