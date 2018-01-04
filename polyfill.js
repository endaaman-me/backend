require('datejs') // modify all of Date

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1]
  }
}
