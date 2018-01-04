const pa = require('path')
const fs = require('fs-extra')
const { CACHE_IGONRED_FILES, ARTICLES_DIR }  = require('../config')


let CACHE_DATA = {}
let CACHE_REVISION = 0

async function isUpgradeNeeded() {
  if (!CACHE_REVISION) {
    return true
  }

  const DIR = ARTICLES_DIR

  const paths = (await fs.readdir(DIR))
    .filter((f) => !CACHE_IGONRED_FILES.includes(f))
    .map((f) => pa.join(DIR, f))
    .concat(DIR)

  for (const path of paths) {
    const stat = await fs.stat(path)
    if (stat.mtime.getTime() > CACHE_REVISION) {
      return true
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
  CACHE_REVISION = (new Date()).getTime()
}

module.exports = {
  isUpgradeNeeded,
  getCacheByKey,
  setCacheByKey,
}
