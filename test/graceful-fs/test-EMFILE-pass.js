var assert = require('assert'),
    constants = require('constants');

require('./lstatFake')({
    err: 'EMFILE',
    rejections: 2    
})


var done = function (err) {
    if (err) { console.log('rimraf failed:', err); }
    else {
        require('fs').original_lstat('target', function(er) {
            assert.strictEqual(er.errno, constants.ENOENT);
            console.log('passed');
        })
    }
}

var rimraf = require('../../' + process.argv[2]);
rimraf(process.argv[3], done);


