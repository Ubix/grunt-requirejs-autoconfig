
requirejs.config({
    "baseUrl": "/",
    "paths": {
        "libfile": "http://localhost/lib/libfile",
        "mylib": "http://localhost/mylib"
    },
    "shim": {},
    "map": {
        "*": {
            "foo": "bar",
            "my-lib": "mylib"
        }
    }
});

define( [ 'mylib' ], function(mylib) {
    return function() {
        mylib.myMethod();
    }
});
