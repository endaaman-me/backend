const REG_SLUG = /^(?:[a-z0-9-_]+|(?:[a-z0-9-_]+\/[a-z0-9-_]+))$/

function validate(article) {
  const data = article.toJSON()
  const result = Joi.validate(data, Joi.object({
    slug: Joi.string().regex(REG_SLUG),
    aliases: Joi.array().items(Joi.string()),
    title: Joi.string(),
    digest: Joi.string().allow(''),
    image: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string()),
    content: Joi.string(),
    priority: Joi.number().min(0).integer(),
    visiblity: Joi.string().allow(Object.values(Article.Visiblity)),
    date : Joi.date(),
    created_at : Joi.date(),
    updated_at : Joi.date(),
  }))

  if (!result.error) {
    return null
  }
  return result.error
}

module.exports = {
  validate,
}
