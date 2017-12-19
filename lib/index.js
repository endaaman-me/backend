function wrapp(promise) {
  return promise.then(function(...args) {
    return [ null, ...args ]
  }, function(error) {
    return [ error ]
  })
}

module.exports = {
  wrapp,
}
