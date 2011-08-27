//Extend the needed fs functions to auto-retry    
var retryfs = function(fs, opts) {
    var opts_ = opts || {}
    this.maxBusyTries = opts_.maxBusyTries || 3
    this.maxEMFILETries = opts_.maxEMFILETries || 100
    
    var wrap = function(fn) {
        return function(p, cb) {
            var tries = 0;
            fn(p, function retry(er, f) {
                if (!er) return cb(null, f)
                tries ++
                if (er.message.match(/^EBUSY/) && tries < this.maxBusyTries) {
                    var time = (this.maxBusyTries - tries) * 100
                    return setTimeout(function () {
                        fn(p, retry)
                    }, time)
                }
                if (er.message.match(/^EMFILE/) && tries < this.maxEMFILETries) {
                    return setTimeout(function () {
                        fn(p, retry)
                    }, tries)
                }
                //some other error to pass on...
                cb(er) 
            });
        }
    }
    //this could be more programatic like Object.keys(fs).forEach(...
    return {
        lstat : wrap(fs.lstat),
        readdir: wrap(fs.readdir),
        unlink: wrap(fs.unlink),
        rmdir: wrap(fs.rmdir)
    }
}

var fs, path = require('path');

module.exports = function rimraf(p, opts, cb) {
    if (typeof opts === "function") cb = opts, opts = {}
    opts.maxRetries = opts.maxRetries || 3
    
    fs = retryfs(require('fs'));
    
    var actions = {
        file: fs.unlink,
        dir: fs.rmdir,
        link: opts.gently ? rmlink : fs.unlink
    }
    crawl(p, actions, cb);
    
    var rmlink = function(p, cb) {
        //extended link clobber test and functionality goes here...
        return fs.unlink;
    }
}

//crawl and run actions over a tree
var crawl = function(p, actions, cb) {
    var sieve = function (p, cb) {
        fs.lstat(p, function (er, s) {
            (er) ? cb(er.message.match(/^ENOENT/) ? null : er) : getAction(s)(p, cb)
        });
        var getAction = function(s) {
            return  s.isSymbolicLink() ? actions.link :
                    s.isDirectory() ? dirAfterRecurse :        
                    actions.file
        }
    }
    sieve(p, cb);

    //dir action comes after actions are performed on children
    var dirAfterRecurse = function (p, cb) {
        fs.readdir(p, function(er, files) {
            if (er) return cb(er)
            if (!files.length) return actions.dir(p, cb)
            
            var whenDone = after(files.length, function() { actions.dir(p, cb) })
            files.forEach(function(file) {
                sieve(path.join(p, file), whenDone)
            })
        })
        
        var after = function(c, fn) {
            var count = c, errState = null;
            return function(er) {
                if (errState) return
                if (er) return cb(errState = er)
                if (-- count === 0) fn() 
            }
        }
    }
}




