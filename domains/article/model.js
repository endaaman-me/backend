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

  isPublic() {
    return this.visiblity !== Visiblity.PRIVATE
  }

  constructor(obj) {
    const result = Joi.validate(obj, Joi.object({
      slug: Joi.string().regex(REG_SLUG).required(''),
      content: Joi.string().allow(''),
    })
    const d = new Date()
    const sp = slug.split('/')
    const value = {
      obj.slug,
      obj.content,
      aliases: []
      title: sp[sp.length-1]
      image: ''
      digest: ''
      tags: []
      priority: 0
      visiblity: Article.Visiblity.PUBLIC,
      date: fecha.format(d, 'YYYY-MM-DD'),
      ...obj,
    }
    this.isSlugChanged = false
    this.created_at = d
    this.updated_at = d
  }

  extend(obj) {
    const oldSlug = this.value.slug
    this.isSlugChanged = true
    Object.assign(this.value, obj)
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
  Article,
}
