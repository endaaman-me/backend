const Joi = require('joi')


const META_KEYS = [
  'name',
]

const FIELD_ERROR = Symbol()

class Category {
  getError() {
    return this[FIELD_ERROR]
  }

  constructor(slug, name) {
    this.slug = slug
    this.name = name
  }

  copy() {
    return (new Category(this.slug, this.name)).extend(this)
  }

  extend(obj) {
    return Object.assign(this, obj)
  }

  validate() {
    const result = Joi.validate(this, Joi.object({
      slug: Joi.string(),
      name : Joi.string(),
    }))

    if (result.error) {
      this[FIELD_ERROR] = result.error
      return false
    } else {
      this[FIELD_ERROR] = null
      return true
    }
  }
}

module.exports = {
  Category
}
