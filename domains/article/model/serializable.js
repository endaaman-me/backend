const fecha = require('fecha')
const yaml = require('js-yaml')

const { Visiblity } = require('../constant')
const { META_DELIMITTER } = require('../../../config')

function defaultFillFunc(v) {
  return !!v
}

const META_FIELDS = [
  {
    key: 'aliases',
    fill: (v) => v && v.length,
  }, {
    key: 'title',
    fill: (v, o) => v && o.getSlug() && o.getSlug().split('/').pop() !== v
  }, {
    key: 'digest',
  }, {
    key: 'image',
  }, {
    key: 'tags',
    fill: (v) => v && v.length > 0,
    morph(tags) {
      const tt = [...tags]
      tt.sort((a, b) => a.localeCompare(b))
      return tt
    },
  }, {
    key: 'private',
    fill: (v) => v,
  }, {
    key: 'special',
    fill: (v) => v,
  }, {
    key: 'priority',
  }, {
    key: 'visiblity',
    fill: (v) => v && v !== Visiblity.DEFAULT,
  }, {
    key: 'date',
    fill: (v, o) => {
      if (!v) return false
      const compared = o._.updatedAt || new Date()
      return fecha.format(compared, 'YYYY-MM-DD') !== v
    }
  },
]

const SerializableImpl = {
  toText() {
    let hasMetaField = false
    const meta = {}
    for (const field of META_FIELDS) {
      const fill = field.fill || defaultFillFunc
      if (fill(this.data[field.key], this)) {
          meta[field.key] = field.morph
            ? field.morph(this.data[field.key])
            : this.data[field.key]
        hasMetaField = true
      }
    }
    if (!hasMetaField) {
      return this.data.content
    }

    const D = META_DELIMITTER
    const metaText = yaml.safeDump(meta, { 'sortKeys': true })
    return `${D}\n${metaText}${D}\n${this.data.content}`
  },

  toJSON() {
    return {
      ...this.data,
      ...{
        updated_at: this._updatedAt,
        created_at: this._createdAt,
      }
    }
  }
}

module.exports = {
  SerializableImpl,
}
