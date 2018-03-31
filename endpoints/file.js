const pa = require('path')
const Joi = require('joi')
const fs = require('fs-extra')
const busboy = require('async-busboy')
const Router = require('koa-router')
const protected = require('../middlewares/protected')
const { listDir, saveFiles, deleteFile, moveFile, makeDir } = require('../domains/file')


const router = new Router()
const J = pa.join.bind(pa)

router.get('/:path*', protected, async (ctx, next) => {
  ctx.body = await listDir(ctx.params.path || '')
})

router.post('/:dir*', protected, async (ctx, next) => {
  console.log('upload')
  const { files, fields } = await busboy(ctx.req)
  await saveFiles(ctx.params.dir || '', files)
  ctx.status = 201
})

router.delete('/:path*', protected, async (ctx, next) => {
  await deleteFile(ctx.params.path || '')
  ctx.status = 204
})

router.put('/:path*', protected, async (ctx, next) => {
  await makeDir(ctx.params.path || '')
  ctx.status = 200
})

router.patch('/:path*', protected, async (ctx, next) => {
  const { path } = ctx.params
  const { dest } = ctx.request.body
  const { error } = Joi.validate({ path, dest }, {
    path: Joi.string().required(),
    dest: Joi.string().required(),
  })
  if (error) {
    ctx.throw(400, error)
    return
  }
  await moveFile(path, dest)
  ctx.status = 204
})

module.exports = router
