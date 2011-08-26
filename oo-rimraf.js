var fs = require('fs'),
    path = require('path');

module.exports = function rimraf(p, cb) {
    fs.crawl(p, fs.unlink, fs.rmdir, cb);
}

//Encapuslate running file and dir actions over a tree

fs.crawl = function(p, fileAction, dirAction, cb) {
    var sieve = function (p, cb) {
        fs.lstat(p, function (er, s) {
            (er) ? cb(er) : (!s.isDirectory() ? fileAction : dirWithRecurse)(p, cb);
        });
    }
    sieve(p, cb);
    
    //dir action comes after action is performed on children
    var dirWithRecurse = function (p, cb) {    
        DirectoryList.get(p, function (er, list) {
            (er) ? cb(er) : list.each(sieve, function() {
                dirAction(p, cb)
            })
        });
    }
}

//Encapulate returning array of full paths
//and provide async foreach over that list
function DirectoryList(p, files) {
    this.list = files.map(function (f) {
        return path.join(p, f);
    });
}
DirectoryList.get = function(p, cb) {
    fs.readdir(p, function(er, files) {
        (er) ? cb(er) : cb(null, new DirectoryList(p, files));
    })
}
DirectoryList.prototype.each = function(fn, cb) {
    //or use your favorite async control module...
    var list = this.list;
    if (!list.length) { return cb() }
    var c = list.length, errState = null;
    list.forEach(function (item, i, list) {
        fn(item, function (er) {
          if (errState) return
          if (er) return cb(errState = er)
          if (-- c === 0) return cb()
        })
    })
}