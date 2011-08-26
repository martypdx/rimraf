module.exports = rimraf
rimraf.sync = rimrafSync

var path = require("path")
  , fs = require("fs")

function rimraf (p, cb) {
  fs.lstat(p, function (er, s) {
    (er) ? cb(er) : rm_(p, s, opts, cb);
  })
}

function rm_ (p, s, cb) {
  if (!s.isDirectory()) return fs.unlink(p, cb)
  fs.readdir(p, function (er, files) {
    if (er) return cb(er)
    asyncForEach(files.map(function (f) {
      return path.join(p, f)
    }), function (file, cb) {
      rimraf(file, opts, cb)
    }, function (er) {
      if (er) return cb(er)
      fs.rmdir(p, cb)
    })
  })
}

function asyncForEach (list, fn, cb) {
  if (!list.length) cb()
  var c = list.length
    , errState = null
  list.forEach(function (item, i, list) {
    fn(item, function (er) {
      if (errState) return
      if (er) return cb(errState = er)
      if (-- c === 0) return cb()
    })
  })
}

// this looks simpler, but it will fail with big directory trees,
// or on slow stupid awful cygwin filesystems
function rimrafSync (p) {
  var s = fs.lstatSync(p)
  if (!s.isDirectory()) return fs.unlinkSync(p)
  fs.readdirSync(p).forEach(function (f) {
    rimrafSync(path.join(p, f))
  })
  fs.rmdirSync(p)
}
