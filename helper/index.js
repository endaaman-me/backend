function wr(promise) {
  return promise.then(function(...args) {
    return [ null, ...args ]
  }, function(error) {
    return [ error ]
  })
}

class ResumableError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ResumableError'
  }
}

module.exports = {
  wr,
  ResumableError,
}
