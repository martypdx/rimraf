var assert = require('assert'),
    constants = require('constants');

require('./lstatFake')({
    err: 'EBUSY',
    rejections: 3    
})

var done = function (er) {
    assert.ok(er, 'error expected') 
    assert.strictEqual(er.errno, constants.EBUSY);
    console.log('passed');
}

var rimraf = require('../../' + process.argv[2]);
rimraf(process.argv[3], done);


