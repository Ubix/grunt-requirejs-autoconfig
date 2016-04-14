'use strict';

var grunt = require('grunt');
var path = require('path');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

function compareFile(test, testFile, expectedFile) {
    test.ok(grunt.file.exists(testFile));

    var expectedContents = grunt.file.read(path.join('test', 'expected', expectedFile));
    var testContents = grunt.file.read(testFile);
    test.equal(testContents, expectedContents);
}

exports.requirejs_autoconfig = {
    dev: function (test) {
        test.expect(2);

        compareFile(test, path.join('test', 'tmp', 'dev', 'main.js'), path.join('dev', 'main.js'));

        test.done();
    },
    optimizer: function (test) {
        test.expect(6);

        var testPath = path.join('test', 'tmp', 'optimizer');
        compareFile(test, path.join(testPath, 'main.js'), path.join('optimizer', 'main.js'));
        compareFile(test, path.join(testPath, 'require-config.js'), path.join('optimizer', 'require-config.js'));
        compareFile(test, path.join(testPath, 'ignored', 'extralib.js'), path.join('optimizer', 'ignored', 'extralib.js'));

        test.done();
    },
    standalone: function (test) {
        test.expect(8);

        var testPath = path.join('test', 'tmp', 'standalone');
        compareFile(test, path.join(testPath, 'main.js'), path.join('standalone', 'main.js'));
        compareFile(test, path.join(testPath, 'require-config.js'), path.join('standalone', 'require-config.js'));
        compareFile(test, path.join(testPath, 'wrap.start'), path.join('standalone', 'wrap.start'));
        compareFile(test, path.join(testPath, 'wrap.end'), path.join('standalone', 'wrap.end'));

        test.done();
    },
    module: function (test) {
        test.expect(4);

        var testPath = path.join('test', 'tmp', 'module');
        compareFile(test, path.join(testPath, 'main.js'), path.join('module', 'main.js'));
        compareFile(test, path.join(testPath, 'require-config.js'), path.join('module', 'require-config.js'));

        test.done();
    }
};

require('nodeunit').on('complete', function() {
    //grunt.file.delete(path.join('test', 'tmp'), { force:true });
});