(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.Lib = factory();
    }
}(this, function() {
    return {
        libMethod: function() {
            console.log('libMethod: hello');
        }
    }
}));
