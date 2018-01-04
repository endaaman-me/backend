const pa = require('path')
const fs = require('fs-extra')

const { ARTICLES_DIR, WARNING_FILE_NAME } = require('../config')


const PA = pa.join(ARTICLES_DIR, WARNING_FILE_NAME)

async function readWarning() {
  if (!fs.existsSync(PA)) {
    return {}
  }
  const text = await fs.readFile(PA, 'utf-8')
  let obj = {}
  try {
    obj = JSON.parse(text)
  } catch (e) {
    // skip
  }
  return obj
}

async function writeWarning(obj) {
  const text = JSON.stringify(obj, null, 2)
  await fs.writeFile(PA, text)
}

async function setWarningsByKey(key, warnings) {
  const obj = await readWarning()
  obj[key] = warnings
  await writeWarning(obj)
}


async function getAllWarning() {
  return readWarning()
}

module.exports = {
  setWarningsByKey,
  getAllWarning,
}
