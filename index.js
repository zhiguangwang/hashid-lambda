// console.log('Loading function');

// For testing with DynamoDB Local
// var aws = require('aws-sdk');
// var doc = require('dynamodb-doc');
// aws.config.update({
//     accessKeyId: "[YOUR-AWS-ACCESS-KEY-ID]",
//     region: "local",
//     endpoint: new aws.Endpoint("http://localhost:8000")
// });
// var awsClient = new aws.DynamoDB();
// var dynamo = new doc.DynamoDB(awsClient);

// For deploying to Lambda
var doc = require('dynamodb-doc');
var dynamo = new doc.DynamoDB();

var Hashids = require("hashids");

var ALPHABET_BASE62  = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
var ALPHABET_BASE36U = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
var ALPHABET_BASE36L = 'abcdefghijklmnopqrstuvwxyz1234567890';
var ALPHABET = {
    "62": ALPHABET_BASE62,
    "36u": ALPHABET_BASE36U,
    "36l": ALPHABET_BASE36L,
}

exports.handler = function(evt, context) {
    // console.log('Received evt:', JSON.stringify(evt, null, 2));

    if (!evt.table) {
        context.fail(new Error("Missing DynamoDB table name."));
        return;
    }
    if (!evt.name) {
        context.fail(new Error("Missing Hashid name."));
        return;
    }
    
    var minLength = parseInt(evt.minLength, 10);
    if (isNaN(minLength) || minLength < 0) {
        minLength = 7;
    }
    
    if (!evt.alphabet || !ALPHABET[evt.alphabet]) {
        evt.alphabet = "62";
    }
    
    var hashKey = evt.name + "-" + minLength + "-" + evt.alphabet;
    var salt = hashKey;

    var hashids = new Hashids(salt, minLength, ALPHABET[evt.alphabet]);
    
    var params = {
        TableName: evt.table,
        Key: { HashidName: hashKey },
        UpdateExpression: "ADD #att :val",
        ExpressionAttributeNames: { "#att": "HashidValue" },
        ExpressionAttributeValues: { ":val": 1 },
        ReturnValues: "UPDATED_NEW"
    };

    dynamo.updateItem(params, function(err, data) {
        if (err) {
            context.fail(err);
        } else {
            var number = data.Attributes.HashidValue;
            var encoded = hashids.encode(number);
            context.succeed({
                "id": encoded,
                "decoded": number,
                "name": evt.name,
                "minLength": minLength,
                "alphabet": evt.alphabet
            });
        }
    });
};