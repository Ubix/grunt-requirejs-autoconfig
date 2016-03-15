//!require.map "*":{ "my-lib": "mylib" }

define([ 'libfile' ], function(lib) {
    return {
        myMethod: function() {
            lib.libMethod();
        }
    }
});
