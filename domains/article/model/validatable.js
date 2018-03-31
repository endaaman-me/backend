const Joi = require('joi')


// const REG_SLUG = /^(?:[a-z0-9-_]+|(?:[a-z0-9-_]+\/[a-z0-9-_]+))$/
const REG_SLUG = /^[a-z0-9-_]+$/

const REG_DATE = /^[1-9]\d\d\d-((10|11|12)|0[1-9])-((30|31)|([1-2][0-9])|(0[1-9]))$/

const ValidatableImpl = {
  validate() {
    const { error } = Joi.validate(this.data, Joi.object({
      slug      : Joi.string().regex(REG_SLUG).required(),
      parent    : Joi.string().regex(REG_SLUG).allow(null),
      content   : Joi.string().allow(''),
      aliases   : Joi.array().items(Joi.string()),
      title     : Joi.string().allow(''),
      digest    : Joi.string().allow(''),
      private   : Joi.boolean(),
      special   : Joi.boolean(),
      image     : Joi.string().allow(''),
      tags      : Joi.array().items(Joi.string().regex(/^\S+$/)),
      priority  : Joi.number().min(0).integer(),
      date      : Joi.string().regex(REG_DATE).required(),
    }))
    return error
  }
}

module.exports = {
  ValidatableImpl,
}
