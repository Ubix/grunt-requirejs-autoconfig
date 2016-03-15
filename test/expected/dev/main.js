
requirejs.config({
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
});
define('main', [ 'mylib' ], function(mylib) {
    return function() {
        mylib.myMethod();
    }
});
