var index = require("./index");

var evt = {
    table: "hashid",
    name: "test",
    minLength: 7,
    alphabet: "36u"
};

var context = {
    fail: function(err) {
        console.log("fail", err);
    },
    succeed: function(output) {
        console.log("succeed", output);
    }
};

index.handler(evt, context);
