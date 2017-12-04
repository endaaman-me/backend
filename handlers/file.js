const pa = require('path')
const fs = require('fs-extra')
const cp = require('fs-cp')
const config = require('../config')


const J = pa.join.bind(pa)

function convertStatToData(stat, name, dir, compact) {
  if (compact) {
    return { name }
  } else {
    return {
      name,
      dir,
      stat: {
        size: stat.size,
        ctime: stat.ctime,
        mtime: stat.mtime,
      },
    }
  }
}

async function walkDir(base, dir, compact) {
  const absDirName = J(base, dir)
  if (!fs.existsSync(absDirName)) {
    return null
  }
  const results = []
  const names = await fs.readdir(absDirName)
  for (const name of names) {
    const stat = await fs.stat(J(base, dir, name))
    const data = convertStatToData(stat, name, dir, compact)
    results.push(data)
    if (stat.isDirectory()) {
      data.children = await walkDir(base, J(dir, name), compact)
    }

  }
  return results
}

function getFiles(dir, compact) {
  return walkDir(config.SHARED_DIR, dir, compact)
}


function saveFiles(files, destDir) {
  const filenames = []
  const wg = []
  for (const file of files) {
    const filename = file.filename.toLowerCase()
    filenames.push(filename)
    wg.push(cp(file, J(destDir, filename)))
  }
  return Promise.all(wg)
}

module.exports = {
  getFiles,
  saveFiles,
}
