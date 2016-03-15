
require("require-config", function() {
define('main', [ 'mylib' ], function(mylib) {
    return function() {
        mylib.myMethod();
    }
});

});
