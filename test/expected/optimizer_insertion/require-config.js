// require config for optimizer_insertion created by grunt-requireconfig

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
    }
}
);
