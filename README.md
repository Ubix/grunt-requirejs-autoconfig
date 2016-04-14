# grunt-requirejs-autoconfig

> grunt plugin to autogenerate require configuration and prep a library for data-main or standalone.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install https://github.com/Ubix/grunt-requirejs-autoconfig --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-requirejs-autoconfig');
```

## The "requirejs_autoconfig" task

### Overview
In your project's Gruntfile, add a section named `requirejs_autoconfig` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  requirejs_autoconfig: {
    target: {
        cwd: rootPath,
        src: [
            { files: 'lib/**/*.js', config: 'bower.json' },
            { files: [ '*.js', '!mainlib.js' ] }
        ],
        output: 'insertion',
        main: {
            src: 'mainlib.js',
            dest: path.join(buildPath, 'main.js')
        }
    }
  },
});
```

### Options

#### options.cwd

The root folder for all source files.

#### options.dest (_optional_)

The root folder for all output files.  Defautls to `cwd`.

#### options.config (_optional_)

A JSON file containing the base require configuration.

This can either be an `object` containing the configuration, or the path to a JSON file containing the configuration
in a `"require-config": { ... }` block.

_NOTE_: for bower libraries, it is recommended you add a `"require-config"` block into your `bower.json` that provides the require 
configuration necessary for all of your bower components.

In addition to any standard require configuration ((see here))[https://github.com/requirejs/r.js/blob/master/build/example.build.js],
you can include a `"name": { ... }` block that defines alternate library names for files (e.g. `"name": { "exoskeleton": "backbone" }`
would set up the exoskeleton library as "backbone" in the require config).  You can also include a `"ignore": [ ... ]` array that
lists the files to not include in the require config `paths`.

#### options.src (_required_)

The source files to parse and add to the require config.
May be an array of source specifications.

##### options.src.files

The file pattern(s) to look for.  Conforms with the specifications for (`grunt.file.expand`)[http://gruntjs.com/api/grunt.file#grunt.file.expand].

##### options.src.config _(optional)_

Supplementary require configuration for the source files (specific to the current group of files).

Follows the same guidelines as the root level `config` option.

#### options.output (_required_)

The method of output for the require config generator.  One of:

* `insertion` - inserts the require configuration into the main output file (see below).
* `module` - generates the require configuration as a require module.
* `optimizer` - generates the require configuration to be used by the (require optimizer)[http://requirejs.org/docs/optimization.html].
* `standalone` - sets up for the optimizer to build a standalone library.

#### options.main (_optional_)

The name of the main library (e.g. the library you would use for `data-main`).

This can be a relative path (which will be relative to the root `cwd` folder for input and the `dest` folder for output),
an absolute path (_WARNING_: this file gets rewritten in certain cases), or an object with explicit paths for `src` and `dest`. 

The output main file will get rewritten based on the `output` option:

* `insertion` - the configuration is inserted into the file.
* `module` - the file may get wrapped by a `require` of the config module.
* `optimizer` - a stripped down version of the configuration will be inserted into the file.
* `standalone` - same as `optimizer`

#### options.module (_optional_)

If the `output` is `module` then this can be an object that includes the `wrap` option.  Set this option to `true` to
to wrap the main output file with a `require` of the configuration module.

#### options.standalone (_optional_)

If the `output` is `standalone` then this can be an object with options:

##### options.standalone.autowrap (_optional_)

If `true` then the require optimizer wrap start/end files will be automatically generated.

##### options.standalone.name (_optional_)

If using autowrap, this value will be used as the main library name to `require` in the end wrapper.

### Configuration Directives

As an alternative to coding up a separate configuration in your gruntfile or JSON to add require configuration settings like
shims and maps, you can place "directives" in your file itself.

#### name

`//!require.name {name}`

Set the name of this library in the require config (by default the name is what is specified in the `define`, or the name of the file).

#### ignore

`//!require.ignore`

Ignore this file (don't add it to the paths)

#### map

`//!require.map {map JSON}`

Add a map specification for this file to the require config.  The _map JSON_ must be correct, parseable JSON.

_Example_: `//!require.map "*": { "foo": "bar" }`

#### shim

`//!require.shim {shim JSON}`

Add a shim specification for this file to the require config.  This _shim JSON_ must be correct, parseable JSON.

_Example_: `//!require.shim "mylib": { "deps": [ "jquery", "lodash" ] }`

#### config & /config

`//!require.config`

In the input main file, this indicates where to insert the require configuration.  If not specified, the start of the file is used.

`//!require./config`

In the input main file, this indicates where to insert the standalone end wrapper.  If not specified, the end of the file is used.

### Usage Examples

#### Development Case

In development it is easiest to keep your source files separate and require them as needed.  With a reasonable 
(watch)[https://github.com/gruntjs/grunt-contrib-watch] setup, development of static assets with require can
be very efficient.

This example assumes that you'll be copying your files into a distribution folder (e.g. `public`), and builds the config
from these deployed files.

```js
grunt.initConfig({
    copy: {
        scripts_dev_: { files: [
            {
                expand: true,
                cwd: 'scripts',
                src: [ '**/*.js' ],
                dest: path.join(distributionPath, 'scripts'),
                flatten: false
            }
        ] }
    },
    requirejs_autoconfig: {
        dev: {
            cwd: path.join(distributionPath, 'scripts'),
            src: [
                { files: 'lib/**/*.js', config: 'bower.json' },
                { files: [ '*.js', '!mainlib.js' ] }
            ],
            output: 'insertion',
            main: 'main.js'
        }
    }
});
```

#### Standalone Production Case

In production everything can get build into a single library using the require optimizer.  This example config assumes
the use of the (grunt-contrib-requirejs)[https://github.com/gruntjs/grunt-contrib-requirejs] plugin.

This example assumes that you'll be copying your files into a temporary build folder (e.g. `build`), and builds the config
from these files.  It then relies on the optimizer to compile everything together.  The default wrappers allow the library
to work as a standalone or as the `data-main` of a require include.  It also assumes the use of (almond)[https://github.com/requirejs/almond] 
to provide the minimal require for a standalone library.

```js
grunt.initConfig({
    copy: {
        scripts_prod_: { files: [
            {
                expand: true,
                cwd: 'scripts',
                src: [ '**/*.js' ],
                dest: path.join(buildPath, 'scripts'),
                flatten: false
            }
        ] }
    },
    requirejs_autoconfig: {
        production: {
            cwd: path.join(buildPath, 'scripts'),
            src: [
                { files: 'lib/**/*.js', config: path.join(__dirname, 'bower.json') },
                { files: [ '*.js', '!mainlib.js' ] }
            ],
            output: 'standalone',
            main: 'main.js',
            standalone: {
                autowrap: true,
                name: 'scripts/main'
            }
        }
    },
    requirejs: { // NOTE: this must run after all files have been copied in place in build folder
        compile: { options: {
            baseUrl: buildPath,
            mainConfigFile: path.join(buildPath, 'scripts', 'require-config.js'),
            include: [ 'lib/almond/almond' ],
            name: 'scripts/main',
            out: path.join(distributionPath, 'scripts', 'main.js'),
            optimize: 'uglify2',
            generateSourceMaps: true,
            preserveLicenseComments: false
        } }
    }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.1.0 - Beta release (tested against in-house applications)
