var assert = require('assert'),
    constants = require('constants');
    
var fs = require('fs');

module.exports = function(opts) {
    var timesToReject = (opts || {}).rejections || 3
    var rejections = 0;
    fs.original_lstat = fs.lstat;
    fs.lstat = function(p, cb){
        if((rejections < timesToReject) && (!opts.file || p===opts.file)) {
            rejections++;
            var er = new Error(opts.err + " fake error")
            er.errno = constants[opts.err]
            er.code = opts.err
            er.path = p
            cb(er);
        } else {
            fs.original_lstat(p, cb);
        }
    }
}


