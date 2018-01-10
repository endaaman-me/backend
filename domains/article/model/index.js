const pa = require('path')
const fs = require('fs-extra')
const fecha = require('fecha')
const Joi = require('joi')
const yaml = require('js-yaml')

const { SerializableImpl } = require('./serializable')
const { ValidatableImpl } = require('./validatable')
const { Visiblity } = require('../constant')


function extractCategorySlug(slug) {
  const splitted = slug.split('/')
  return splitted.length > 1
    ? splitted[0]
    : null
}

function normalize(diff) {
  if (diff > 0) {
    return 1
  }
  if (diff < 0) {
    return -1
  }
  return 0
}


class Article {
  getSlug() {
    return this.data.slug
  }
  isPublic() {
    return this.data.visiblity !== Visiblity.PRIVATE
  }
  isNewely() {
    return this._.isNewely
  }
  getOldSlug() {
    return this._.oldSlug
  }
  getCategorySlug() {
    return extractCategorySlug(this.data.slug)
  }
  getOldCategorySlug() {
    return extractCategorySlug(this._.oldSlug)
  }
  constructor(data) {
    const { slug } = data
    this.data = {
      aliases: [],
      title: slug ? slug.split('/').pop() : '',
      image: '',
      digest: '',
      tags: [],
      priority: 0,
      visiblity: Visiblity.DEFAULT,
      date: fecha.format((new Date()), 'YYYY-MM-DD'),
      ...data,
    }
    this._ = {
      oldSlug: slug,
      isNewely: true,
      createdAt: null,
      updatedAt: null,
    }
  }

  extend(payload) {
    const a = new Article({
      ...this.data,
      ...payload,
    })
    Object.assign(a._, this._)
    return a
  }

  bless(updatedAt, createdAt) {
    this._.oldSlug = this.data.slug
    this._.isNewely = false
    this._.createdAt = updatedAt
    this._.updatedAt = createdAt
  }

  compare(that) {
    const a = fecha.format(new Date(this.data.date), 'YYYY-MM-DD')
    const b = fecha.format(new Date(that.data.date), 'YYYY-MM-DD')
    let diff = normalize(b.localeCompare(a))
    if (diff !== 0) {
      return diff
    }
    return that.data.priority - this.data.priority
  }
}

Object.assign(Article.prototype, SerializableImpl)
Object.assign(Article.prototype, ValidatableImpl)

module.exports = {
  Article,
}
