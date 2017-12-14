const pa = require('path')
const fs = require('fs-extra')
const cp = require('fs-cp')
const config = require('../config')


const J = pa.join.bind(pa)
const BASE_DIR = config.SHARED_DIR

async function checkDir(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`${dir} is not exist`)
  }

  const dirStat = await fs.stat(dir)
  if (!dirStat.isDirectory()) {
    throw new Error(`${dir} is not directory`)
  }
}


async function listDir(dirSlug) {
  const dir = J(BASE_DIR, dirSlug)
  await checkDir(dir)

  results = []
  const names = await fs.readdir(dir)
  for (const name of names) {
    const stat = await fs.stat(J(dir, name))
    const data = {
      name,
      size: stat.size,
      mtime: stat.mtime,
      is_dir: stat.isDirectory(),
    }
    results.push(data)
  }

  results.sort((a, b) => {
    if (a.is_dir ^ b.is_dir) {
      return a.is_dir ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
  return results
}

async function saveFiles(dirSlug, files) {
  const dir = J(BASE_DIR, dirSlug)
  await checkDir(dir)

  // check paths are empty
  const paths = []
  for (const file of files) {
    const path = J(dir, file.filename.toLowerCase())
    if (fs.existsSync(path)) {
      throw new Error(`${dir} already exists`)
    }
    paths.push(path)
  }

  const wg = []
  for (const i in files) {
    const file = files[i]
    const path = paths[i]
    wg.push(cp(file, path))
  }
  return Promise.all(wg)
}

async function deleteFile(slug) {
  const path = J(BASE_DIR, slug)
  if (!fs.existsSync(path)) {
    throw new Error(`${path} does not exist`)
  }

  const stat = await fs.stat(path)
  if (stat.isFile()) {
    await fs.unlink(path)
    return
  }

  if (stat.isDirectory()) {
    const files = await fs.readdir(path)
    if (files.length > 0) {
      throw new Error(`${path} is not empty directory`);
    }
    await fs.rmdir(path)
    return
  }

  throw new Error(`${path} is not file nor directory`);
}

async function moveFile(slug, destSlug) {
  const path = J(BASE_DIR, slug)
  if (!fs.existsSync(path)) {
    throw new Error(`${path} does not exist`)
  }

  const destPath = J(BASE_DIR, destSlug)
  if (fs.existsSync(destPath)) {
    throw new Error(`dest path(${destPath}) already exists`)
  }
  await checkDir(destPath)
  await fs.rename(path, destPath)
}


module.exports = {
  listDir,
  saveFiles,
  deleteFile,
  moveFile,
}
