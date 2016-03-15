requirejs.config({ map: {
    "*": {
        "foo": "bar",
        "my-lib": "mylib"
    }
}});

define( [ 'mylib' ], function(mylib) {
    return function() {
        mylib.myMethod();
    }
});
