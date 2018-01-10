const Joi = require('joi')
const { ResumableError } = require('../../../helper')


const FIELD_ERROR = Symbol()
const REG_SLUG = /^[a-z0-9-_]+$/

class Category {
  getSlug() {
    return this.data.slug
  }
  isNewely() {
    return this._.isNewely
  }

  constructor(data) {
    this.data = {
      name: data && data.slug,
      priority: 0,
      ...data,
    }
    this._ = {
      isNewely: true,
    }
  }

  extend(payload) {
    if ('slug' in payload) {
      throw new ResumableError('do not modify "slug" field')
      return
    }
    const a = new Category({
      ...this.data,
      ...payload,
    })
    Object.assign(a._, this._)
    return a
  }

  bless() {
    this._.isNewely = false
  }

  compare(a) {
    const diff = this.data.priority - a.data.priority
    if (diff !== 0) {
      return diff
    }
    return this.data.name.localeCompare(a.data.name)
  }

  toJSON() {
    return this.data
  }

  toText() {
    const obj = { ...this.data }
    delete obj['slug']
    if (this.data.slug === this.data.name) {
      delete obj['name']
    }
    if (this.data.priority === 0) {
      delete obj['priority']
    }
    return JSON.stringify(obj, null, 2)
  }

  validate() {
    const { error } = Joi.validate(this.data, Joi.object({
      slug: Joi.string().regex(REG_SLUG).required(),
      name: Joi.string(),
      priority: Joi.number().min(0).integer(),
    }))
    return error
  }
}

module.exports = {
  Category
}
