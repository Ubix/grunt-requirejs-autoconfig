/*
 * grunt-requirejs-autoconfig
 * https://github.com/Ubix/grunt-requirejs-autoconfig
 *
 * Copyright (c) 2016 Rick Lamoreaux/UBIX Labs
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var objectAssignDeep = require('object-assign-deep');
var util = require('util');

module.exports = function(grunt) {
    var rootPath = function(rootFolder, p) {
        return (path.isAbsolute(p) ? p : path.resolve(rootFolder, p));
    }

    var requireConfigGenerator = function(grunt, cfgFile, cfg) {
        grunt.log.debug('generating require config for ' + cfgFile);
        var rootFolder = cfg.cwd || '.';
        var destPath = rootPath(rootFolder, cfg.dest || '.');

        var requireConfig = {
            baseUrl: cfg.baseUrl || '/',
            paths: { },
            shim: { },
            map: { }
        };
        if (cfg.config) {
            requireConfig = objectAssignDeep(requireConfig, cfg.config);
        }

        // now walk sources
        var sources = cfg.src || [];
        if (!util.isArray(sources)) { sources = [ sources ]; }
        for (var srcIdx = 0; srcIdx < sources.length; srcIdx++) {
            var sourceFiles = sources[srcIdx];
            var sourceConfig = null;
            if (util.isObject(sourceFiles)) {
                sourceConfig = sourceFiles.config;
                sourceFiles = sourceFiles.files || '*.js';
            }
            grunt.verbose.debug('processing sources: ' + JSON.stringify(sourceFiles));
            var libNames = {};
            var ignoreNames = [];
            // open config file (if any) and attach map/shims/paths to base config
            if (sourceConfig && util.isString(sourceConfig)) {
                grunt.log.debug('reading config file: ' + sourceConfig);
                sourceConfig = grunt.file.readJSON(rootPath(rootFolder, sourceConfig))['require-config'];
            }
            if (sourceConfig) {
                // if config file has name mappings, build name mapping lookup
                if (sourceConfig.name) {
                    libNames = sourceConfig.name;
                    delete sourceConfig.name;
                }
                if (sourceConfig.ignore) {
                    ignoreNames = sourceConfig.ignore;
                    delete sourceConfig.ignore;
                }
                if (sourceConfig.paths) {
                    grunt.verbose.debug('adding to paths: ' + JSON.stringify(sourceConfig.paths));
                    requireConfig.paths = Object.assign(requireConfig.paths, sourceConfig.paths);
                }
                if (sourceConfig.shim) {
                    grunt.verbose.debug('adding to shim: ' + JSON.stringify(sourceConfig.shim));
                    requireConfig.shim = objectAssignDeep(requireConfig.shim, sourceConfig.shim);
                }
                if (sourceConfig.map) {
                    grunt.verbose.debug('adding to map: ' + JSON.stringify(sourceConfig.map));
                    requireConfig.map = objectAssignDeep(requireConfig.map, sourceConfig.map);
                }
            }
            ignoreNames.push('require'); // always ignore require
            // walk source files and add to paths
            var srcFiles = grunt.file.expand({ cwd: rootFolder }, sourceFiles);
            for (var fileIdx = 0; fileIdx < srcFiles.length; fileIdx++) {
                var srcFile = rootPath(rootFolder, srcFiles[fileIdx]);
                var ext = path.extname(srcFile);
                var fname = path.basename(srcFile, ext);
                if (ignoreNames.indexOf(fname) >= 0) { continue; }
                // default name is file name without path/ext
                var name = fname;
                // if no config, open source files and look for //!require directives:
                if (!sourceConfig) {
                    grunt.verbose.debug('checking ' + srcFile);
                    var shimDef = null;
                    var fcontent = grunt.file.read(srcFile);
                    var directives = fcontent.match(/(^|\n)\s*\/\/!require\.(.*)/g);
                    if (directives) {
                        var ignore = false;
                        var nameDefined = false;
                        for (var dirIdx = 0; dirIdx < directives.length; dirIdx++) {
                            var directive = directives[dirIdx].replace(/^\s*\/\/!require\./, '');
                            if (directive.indexOf('ignore') === 0) {
                                // !require.ignore - skip this file
                                ignore = true;
                                grunt.verbose.debug('ignore directive, skipping');
                                break;
                            } else if (directive.indexOf('map ') === 0) {
                                // !require.map - JSON to add to config "map"
                                var map = directive.substring(4).trim();
                                if (map.indexOf('{') !== 0) { map = '{ ' + map + ' }'; }
                                map = JSON.parse(map);
                                requireConfig.map = objectAssignDeep(requireConfig.map, map);
                                grunt.verbose.debug('adding to map: ' + JSON.stringify(map));
                            } else if (directive.indexOf('shim ') === 0) {
                                // !require.shim - JSON to add to config "shim" for this file
                                shimDef = directive.substring(5).trim();
                                if (shimDef.indexOf('{') !== 0) { shimDef = '{ ' + shimDef + ' }'; }
                                shimDef = JSON.parse(shimDef);
                            } else if (directive.indexOf('name ') === 0) {
                                // !require.name - name to use for this file in require
                                name = directive.substring(5).trim();
                                grunt.verbose.debug('name directive, name = ' + name);
                                nameDefined = true;
                                // TODO: check validity of name?
                            }
                        }
                        if (ignore) { continue; }
                        // if name not specified, look for "define('name'" or 'define("name"'
                        if (!nameDefined) {
                            var define = fcontent.match(/(^|\s+)define\s*\(\s*(["'])((\\\2|.)*?)\2/);
                            if (define && define[3]) { name = define[3]; }
                            grunt.verbose.debug('name from define: ' + name);
                        }
                        if (shimDef) {
                            var shim = {};
                            shim[name] = shimDef;
                            grunt.verbose.debug('adding to shim: ' + JSON.stringify(shim));
                            requireConfig.shim = objectAssignDeep(requireConfig.shim, shim);
                        }
                    }
                }
                grunt.log.debug('adding file ' + srcFile + ' as ' + name);
                // if config, do lookup to see if there is an alternate name
                name = libNames[fname] || name;
                if (requireConfig.paths[name]) {
                    grunt.fail.fatal('library ' + name + ' defined for file: ' + requireConfig.paths[name] + ' and ' + srcFile);
                    return;
                }

                // make path relative to rootFolder
                srcFile = path.relative(rootFolder, srcFile);
                // add to paths
                requireConfig.paths[name] = srcFile.replace(/\.js$/i, '');
            }
        }
        if (cfg.output === 'standalone' && cfg.standalone && cfg.standalone.config) {
            requireConfig = objectAssignDeep(requireConfig, cfg.standalone.config);
        }
        // write the wrap files
        if (cfg.output === 'standalone' && cfg.standalone && cfg.standalone.autowrap && cfg.standalone.name) {
            var topWrap = '\n(function (root, factory) {\n' +
                '  if (typeof define === "function" && define.amd) {\n' +
                '    define([], factory);\n' +
                '  } else {\n' +
                '    root.Ubix = factory();\n' +
                '  }\n' +
                '}(this, function() {\n';
            var topWrapFile = path.resolve(destPath, 'wrap.start');
            grunt.file.write(topWrapFile, topWrap);

            var bottomWrap = '\n  return require("' + cfg.standalone.name + '");\n' +
                '}));\n';
            var bottomWrapFile = path.resolve(destPath, 'wrap.end');
            grunt.file.write(bottomWrapFile, bottomWrap);

            requireConfig.wrap = {
                startFile: topWrapFile,
                endFile: bottomWrapFile
            };

            grunt.log.debug('generated standalone wrap files');
        }
        // build require file if needed
        var moduleName = null;
        if (cfg.output === 'optimizer' || cfg.output === 'standalone' || cfg.output === 'module') {
            var module = (cfg.output === 'module');
            var destFile = rootPath(destPath, cfg.out || './require-config.js');
            var ext = path.extname(destFile);
            if (ext === '.' || ext === '') {
                ext = '.js';
                destFile += (ext === '' ? '.' : '') + 'js';
            }

            var configFileContents = '// require config for ' + cfgFile + ' created by grunt-requireconfig\n\n';

            if (module) {
                moduleName = path.basename(destFile, '.js');
                configFileContents += 'define("' + moduleName + '", function() {\n';

                requireConfig.paths[moduleName] = path.relative(destPath, srcFile).replace(/\.js$/i, '');
            }
            configFileContents += 'requirejs.config(\n' + JSON.stringify(requireConfig, null, 4) + '\n);\n';
            if (module) {
                configFileContents += '\n});\n';
            }

            // write the config file
            grunt.file.write(destFile, configFileContents);
            grunt.log.debug('wrote config file: ' + destFile);
        }
        if (cfg.main) {
            var mainInFile = cfg.main;
            var mainOutFile = cfg.main;
            if (util.isObject(cfg.main)) {
                mainInFile = cfg.main.src;
                mainOutFile = cfg.main.dest;
            }
            mainInFile = rootPath(rootFolder, mainInFile);
            mainOutFile = rootPath(destPath, mainOutFile);
            var rewriteMsg = null;

            // open main file and insert require of config in place of !require.config
            var mainContents = grunt.file.read(mainInFile);
            var replPattern = /^/;
            if (mainContents.match(/($|\n)\s*\/\/!require\.config/)) {
                replPattern = /\/\/!require\.config.*/;
            }

            var cfgInsert = null;
            if (cfg.output === 'insertion') {
                cfgInsert = '\nrequirejs.config(' + JSON.stringify(requireConfig, null, 4) + ');\n';
                rewriteMsg = 'inserted require config into ' + cfg.main;
            } else if (cfg.output === 'optimizer' || cfg.output === 'standalone') {
                cfgInsert = 'requirejs.config({ map: ' + JSON.stringify(requireConfig.map, null, 4) + '});\n';
                rewriteMsg = 'added optimizer require config to ' + cfg.main;

                // TODO: for some reason, the optimizer needs the root library to be anonymous (maybe).
                // TODO: but it needs to be named to work properly when in development mode.
                mainContents = mainContents.replace(/(^|\s+)define\s*\(\s*(["'])((\\\2|.)*?)\2\s*,/, '\ndefine(');
            } else if (cfg.output === 'module' && cfg.module && cfg.module.wrap && moduleName) {
                cfgInsert = '\nrequire("' + moduleName + '", function() {\n';

                var endReplPattern = /$/;
                if (mainContents.match(/($|\n)\s*\/\/!require\.\/config/)) {
                    endReplPattern = /\/\/!require\.\/config.*/;
                }
                mainContents = mainContents.replace(endReplPattern, '\n});\n');
                rewriteMsg = 'wrapped require for config around ' + cfg.main;
            }

            if (rewriteMsg) {
                if (cfgInsert) {
                    mainContents = mainContents.replace(replPattern, cfgInsert);
                }

                grunt.file.write(mainOutFile, mainContents);
                grunt.log.debug(rewriteMsg);
            }
        }
    };

    grunt.registerMultiTask('requirejs_autoconfig', 'grunt plugin to generate require configuration and prep a library for data-main or standalone.', function() {
        requireConfigGenerator(grunt, this.target, this.data);
    });
};
