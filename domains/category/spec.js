const Joi = require('joi')

const { Category } = require('./model')


function validate(category) {
  const { error } = Joi.validate(category.getData(), Joi.object({
    slug: Joi.string(),
    name : Joi.string(),
  }))

  return error
}

module.exports = {
  validate,
}
