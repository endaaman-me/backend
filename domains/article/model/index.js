const pa = require('path')
const fs = require('fs-extra')
const fecha = require('fecha')
const Joi = require('joi')
const yaml = require('js-yaml')

const { SerializableImpl } = require('./serializable')
const { ValidatableImpl } = require('./validatable')
const { META_DELIMITTER, Visiblity } = require('../constant')

class Article {
  getData() {
    return this.data
  }
  getSlug() {
    return this.data.slug
  }
  getPriority() {
    return this.data.priority
  }
  getDate() {
    return new Date(this.data.date)
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
      isDirty: false,
      isNewely: true,
      createdAt: null,
      updatedAt: null,
    }
  }

  copy() {
    const a = new Article(this.data)
    Object.assign(a._, this._)
    return a
  }

  extend(payload) {
    if (this._.isDirty) {
      throw new Error('this article is already dirty. Do not extend twice')
    }
    Object.assign(this.data, payload)
    this._.isDirty = true
  }

  bless(updatedAt, createdAt) {
    this._.oldSlug = this.data.slug
    this._.isDirty = false
    this._.isNewely = false
    this._.createdAt = updatedAt
    this._.updatedAt = createdAt
  }

  compare(a) {
    // only date
    const x = this.getDate().getTime() - a.getDate().getTime()
    if (x !== 0) {
      return x
    }
    return a.getPriority() - this.getPriority()
  }
}

Object.assign(Article.prototype, SerializableImpl)
Object.assign(Article.prototype, ValidatableImpl)

module.exports = {
  Article,
}
