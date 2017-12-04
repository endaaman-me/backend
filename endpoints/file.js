const pa = require('path')
const fs = require('fs-extra')
const busboy = require('async-busboy')
const Router = require('koa-router')
const config = require('../config')
const { getFiles, saveFiles } = require('../handlers/file')


const router = new Router()

function J(...args) { return path.join(...args) }

router.get('/:path*', async (ctx, next) => {
  const data = await getFiles(ctx.params.path ? ctx.params.path : '.', 'compact' in ctx.query)
  if (!data) {
    ctx.throw(404)
    return
  }
  ctx.body = data
})

router.post('/:dir*', async (ctx, next) => {
  const destDir = J(config.SHARED_DIR, ctx.params.dir || '')
  const { files, fields } = await busboy(ctx.req)

  if (files.length < 1) {
    // create directory
    if (fs.existsSync(destDir)) {
      ctx.throw(404, 'Something already exists in destination directory name')
      return
    }
    await fs.mkdir(destDir)
    ctx.status = 201
    return
  }

  if (!fs.existsSync(destDir)) {
    ctx.throw(404, 'Destination directory does not exist')
    return
  }
  const destDirStat = await fs.stat(destDir)
  if (!destDirStat.isDirectory()) {
    ctx.throw(400, 'Destination directory does not directory')
    return
  }

  await saveFiles(files, destDir)
  ctx.status = 201
})

router.delete('/:path*', async (ctx, next) => {
  const p = J(config.SHARED_DIR, ctx.params.path)
  if (!fs.existsSync(p)) {
    ctx.throw(404)
    return
  }
  const stat = await fs.stat(p)

  if (stat.isDirectory()) {
    const files = await fs.readdir(p)
    if (files.length === 0) {
      await fs.rmdir(p)
    } else {
      ctx.throw(400, 'Can not remove not empty directory');
    }
  } else if (stat.isFile()) {
    await fs.unlink(p)
  } else {
    ctx.throw(400, 'The path is not file nor directory');
  }
  ctx.status = 204
})


router.put('/:path*', async (ctx, next) => {
  const src = J(config.SHARED_DIR, ctx.params.path)
  if (!fs.existsSync(src)) {
    ctx.throw(404)
    return
  }
  if (!ctx.request.body.rename_to) {
    ctx.throw(400, '`rename_to` field is required')
    return
  }
  const dest = J(config.SHARED_DIR, ctx.request.body.rename_to)
  if (fs.existsSync(dest)) {
    ctx.throw(400, 'File already exists in specified path')
    return
  }

  const destDir = path.dirname(dest)
  if (!fs.existsSync(destDir)) {
    ctx.throw(400, 'Destination directory does not exist')
    return
  }
  const destDirStat = await f.sStat(destDir)
  if (!destDirStat.isDirectory()) {
    ctx.throw(400, 'File already exists in destination directory name')
    return
  }

  await fs.rename(src, dest)
  ctx.status = 204
})

module.exports = router
