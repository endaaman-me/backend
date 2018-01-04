const Joi = require('joi')


const FIELD_ERROR = Symbol()

class Category {
  constructor(data) {
    this.data = {
      name: data && data.slug,
      priority: 0,
      ...data,
    }
  }

  extend(obj) {
    return Object.assign(this, obj)
  }

  compare(a) {
    const diff = this.data.priority - a.data.priority
    if (diff > 0) {
      return -1
    }

    if (diff < 0) {
      return 1
    }

    return this.data.name.localeCompare(a.data.name)
  }

  toJSON() {
    return this.data
  }

  validate() {
    const { error } = Joi.validate(this.data, Joi.object({
      slug: Joi.string(),
      name : Joi.string(),
    }))
    return error
  }
}

module.exports = {
  Category
}
