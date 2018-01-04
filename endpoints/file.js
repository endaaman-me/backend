const pa = require('path')
const fs = require('fs-extra')
const busboy = require('async-busboy')
const Router = require('koa-router')

const { listDir, saveFiles, deleteFile, moveFile } = require('../domains/file')


const router = new Router()
const J = pa.join.bind(pa)

router.get('/:path*', async (ctx, next) => {
  ctx.body = await listDir(ctx.params.path || '')
})

router.post('/:dir*', async (ctx, next) => {
  const { files, fields } = await busboy(ctx.req)

  await saveFiles(ctx.params.dir || '', files)
  ctx.status = 201
})

router.delete('/:path*', async (ctx, next) => {
  await deleteFile(ctx.params.path || '')
  ctx.status = 204
})


router.patch('/:path*', async (ctx, next) => {
  await moveFile(ctx.params.path || '', ctx.request.body.dest || '')
  ctx.status = 204
})

module.exports = router
