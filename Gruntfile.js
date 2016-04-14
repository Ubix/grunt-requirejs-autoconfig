/*
 * grunt-requirejs-autoconfig
 * https://github.com/Ubix/grunt-requirejs-autoconfig
 *
 * Copyright (c) 2016 Rick Lamoreaux/UBIX Labs
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');

module.exports = function(grunt) {

// Project configuration.
grunt.initConfig({
    jshint: {
        all: [
            'Gruntfile.js',
            'tasks/*.js',
            '<%= nodeunit.tests %>'
        ],
        options: {
            jshintrc: '.jshintrc'
        }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
        tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    requirejs_autoconfig: {
        dev: {
            cwd: path.join('test', 'fixtures'),
            dest: path.join('..', 'tmp', 'dev'),
            src: [
                { files: 'lib/**/*.js', config: 'cfg.json' },
                { files: [ '*.js', '!mainlib.js' ] }
            ],
            output: 'insertion',
            main: {
                src: 'mainlib.js',
                dest: 'main.js'
            }
        },
        optimizer: {
            cwd: path.join('test', 'fixtures'),
            dest: path.join('..', 'tmp', 'optimizer'),
            src: [
                { files: 'lib/**/*.js', config: 'cfg.json' },
                { files: [ '*.js', '!mainlib.js' ] }
            ],
            output: 'optimizer',
            main: {
                src: 'mainlib.js',
                dest: 'main.js'
            },
            ignored: 'ignored'
        },
        standalone: {
            cwd: path.join('test', 'fixtures'),
            dest: path.join('..', 'tmp', 'standalone'),
            src: [
                { files: 'lib/**/*.js', config: 'cfg.json' },
                { files: [ '*.js', '!mainlib.js' ] }
            ],
            output: 'standalone',
            main: {
                src: 'mainlib.js',
                dest: 'main.js'
            },
            standalone: {
                autowrap: true,
                name: 'main'
            }
        },
        module: {
            cwd: path.join('test', 'fixtures'),
            dest: path.join('..', 'tmp', 'module'),
            src: [
                { files: 'lib/**/*.js', config: 'cfg.json' },
                { files: [ '*.js', '!mainlib.js' ] }
            ],
            output: 'module',
            main: {
                src: 'mainlib.js',
                dest: 'main.js',
            },
            module: {
                wrap: true
            }
        }
    },

    // Unit tests.
    nodeunit: {
        tests: ['test/*_test.js']
    }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'requirejs_autoconfig', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);
};
