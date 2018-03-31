const pa = require('path')
const fs = require('fs-extra')
const fecha = require('fecha')
const Joi = require('joi')
const yaml = require('js-yaml')

const { SerializableImpl } = require('./serializable')
const { ValidatableImpl } = require('./validatable')

function toRelative(parent, slug) {
  return parent ? `${parent}/${slug}` : slug
}


class Article {
  isPublic() {
    return !this.data.private
  }
  isNewely() {
    return this._.isNewely
  }
  getSlug() {
    return this.data.slug
  }
  getOldSlug() {
    return this._.oldSlug
  }
  getParent() {
    return this.data.parent
  }
  getOldParent() {
    return this._.oldParent
  }
  getRelative() {
    return toRelative(this.getParent(), this.getSlug())
  }
  getOldRelative() {
    return toRelative(this.getOldParent(), this.getOldSlug())
  }
  constructor(data) {
    const { slug } = data
    this.data = {
      parent: null,
      title: slug,
      aliases: [],
      image: '',
      digest: '',
      tags: [],
      priority: 0,
      private: false,
      special: false,
      date: fecha.format((new Date()), 'YYYY-MM-DD'),
      ...data,
    }
    this._ = {
      oldSlug: this.data.slug,
      oldParent: this.data.parent,
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
    this._.oldSlug = this.getSlug()
    this._.oldParent = this.getParent()
    this._.isNewely = false
    this._.createdAt = updatedAt
    this._.updatedAt = createdAt
  }

  compare(that) {
    const a = fecha.format(new Date(this.data.date), 'YYYY-MM-DD')
    const b = fecha.format(new Date(that.data.date), 'YYYY-MM-DD')
    let diff = b.localeCompare(a)
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
