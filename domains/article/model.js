const pa = require('path')
const fs = require('fs-extra')
const fecha = require('fecha')
const Joi = require('joi')
const yaml = require('js-yaml')

const config = require('../../config')


function getArticleSlug(slug) {
  const sp = slug.split('/')
  return sp[sp.length - 1]
}

const Visiblity = {
  PUBLIC: 'public',   // 公開
  HIDDEN: 'hidden',   // 公開、リンクあり、トップに表示しないだけ
  SECRET: 'secret',   // 公開、リンクなし
  SPECIAL: 'special', // 公開、特殊ページ
  PRIVATE: 'private', // 非公開、俺用
}
const META_DELIMITTER = '---'

const FIELD_ERROR = Symbol()

const REG_SLUG = /^(?:[a-z0-9-_]+|(?:[a-z0-9-_]+\/[a-z0-9-_]+))$/

const META_FIELDS = [
  {
    key: 'aliases',
    fill: (v) => v && v.length,
  }, {
    key: 'title',
    fill: (v, o) => v && getArticleSlug(o.slug) !== v
  }, {
    key: 'digest',
  }, {
    key: 'image',
  }, {
    key: 'tags',
    fill: (v) => v && v.length,
  }, {
    key: 'priority',
  }, {
    key: 'visiblity',
    fill: (v) => v && v !== Visiblity.PUBLIC,
  }, {
    key: 'date',
    fill: (v, o) => {
      if (!v) return false
      const compared = o.updated_at || new Date()
      return fecha.format(compared, 'YYYY-MM-DD') !== v
    }
  },
]

function getArticlePath(slug) {
  return pa.join(config.ARTICLES_DIR, slug + '.md')
}

class Article {
  static get Visiblity() {
    return Visiblity
  }

  static get META_DELIMITTER() {
    return META_DELIMITTER
  }

  getError() {
    return this[FIELD_ERROR]
  }

  isSecret() {
    return this.visiblity === Visiblity.SECRET
  }

  constructor(slug, content) {
    this.slug = slug
    this.content = content

    const sp = slug.split('/')
    this.aliases = []
    this.title = sp[sp.length-1]
    this.image = ''
    this.digest = ''
    this.tags = []
    this.priority = 0
    this.visiblity = Article.Visiblity.PUBLIC

    const d = new Date()
    this.created_at = d
    this.updated_at = d
    this.date = fecha.format(d, 'YYYY-MM-DD')
  }

  extend(obj) {
    return Object.assign(this, obj)
  }

  copy() {
    return (new Article(this.slug, this.content)).extend(this)
  }

  validate() {
    const result = Joi.validate(this, Joi.object({
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

    if (result.error) {
      this[FIELD_ERROR] = result.error
      return false
    } else {
      this[FIELD_ERROR] = null
      return true
    }
  }

  toText() {
    let hasMetaField = false
    const meta = {}
    for (const field of META_FIELDS) {
      const fill = field.fill || ((v) => !!v)
      if (fill(this[field.key], this)) {
        meta[field.key] = this[field.key]
        hasMetaField = true
      }
    }
    if (!hasMetaField) {
      return this.content
    }

    const metaText = yaml.safeDump(meta, { 'sortKeys': true })
    return `${META_DELIMITTER}\n${metaText}${META_DELIMITTER}\n${this.content}`
  }

  async create() {
    const filepath = getArticlePath(this.slug)
    if (fs.existsSync(filepath)) {
      throw new Error(`slug: \`${this.slug}\` is duplicated`)
      return
    }
    await this.write(true)
  }

  async update(oldSlug) {
    if (!oldSlug) {
      throw new Error('`oldSlug` param is needed for Article.update()')
      return
    }

    const newly = this.slug !== oldSlug

    await this.write(newly)

    if (newly) {
      await fs.unlink(getArticlePath(oldSlug))
    }
  }

  async write(newly) {
    const filepath = getArticlePath(this.slug)
    if (newly) {
      if (fs.existsSync(filepath)) {
        throw new Error(`slug: \`${this.slug}\` is duplicated`)
        return
      }
    }
    await fs.ensureFile(filepath)
    await fs.writeFile(filepath, this.toText())
  }

  async delete(obj) {
    const path = getArticlePath(this.slug)
    if (!fs.existsSync(path)) {
      throw new Error(`can not unlink \`${path}\``)
      return
    }
    await fs.unlink(path)
  }
}

module.exports = {
  Article
}
