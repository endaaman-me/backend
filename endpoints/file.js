const pa = require('path')
const fs = require('fs-extra')
const busboy = require('async-busboy')
const Router = require('koa-router')
const config = require('../config')
const { listDir, saveFiles, deleteFile, moveFile } = require('../handlers/file')


const router = new Router()
const J = pa.join.bind(pa)

router.get('/:path*', async (ctx, next) => {
  let data
  try {
    data = await listDir(ctx.params.path || '')
  } catch (e) {
    ctx.throw(400, e.message)
    return
  }
  ctx.body = data
})

router.post('/:dir*', async (ctx, next) => {
  const { files, fields } = await busboy(ctx.req)

  try {
    await saveFiles(ctx.params.dir || '', files)
  } catch (e) {
    ctx.throw(400, e.message)
    return
  }
  ctx.status = 201
})

router.delete('/:path*', async (ctx, next) => {
  try {
    await unlink(ctx.params.path || '')
  } catch (e) {
    ctx.throw(400, e.message)
    return
  }

  ctx.status = 204
})


router.patch('/:path*', async (ctx, next) => {
  try {
    await moveFile(ctx.params.path || '', ctx.request.body.dest || '')
  } catch (e) {
    ctx.throw(400, e.message)
    return
  }
  ctx.status = 204
})

module.exports = router
