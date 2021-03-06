// require config for module created by grunt-requireconfig

define("require-config", function() {
requirejs.config(
{
    "baseUrl": "/",
    "paths": {
        "libfile": "lib/libfile",
        "mylib": "mylib",
        "require-config": "require-config"
    },
    "shim": {},
    "map": {
        "*": {
            "foo": "bar",
            "my-lib": "mylib"
        }
    }
}
);

});
