// require config for standalone created by grunt-requireconfig

requirejs.config(
{
    "baseUrl": "/",
    "paths": {
        "libfile": "lib/libfile",
        "mylib": "mylib"
    },
    "shim": {},
    "map": {
        "*": {
            "foo": "bar",
            "my-lib": "mylib"
        }
    },
    "wrap": {
        "startFile": "/Users/rick-ubix/Projects/Ubix/grunt-requirejs-autoconfig/test/tmp/standalone/wrap.start",
        "endFile": "/Users/rick-ubix/Projects/Ubix/grunt-requirejs-autoconfig/test/tmp/standalone/wrap.end"
    }
}
);
