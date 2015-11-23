# hashid-lambda

A simple AWS Lambda function that generates hashid with DynamoDB atomic counter.

Inspired by [hashids](http://hashids.org/).

## Desired input/output

### Request

    POST /hashid
    Content-Type: application/json

    {
        "name": "hashidName",
        "minLength": 7,
        "alphabet": "36u"
    }

### Response

    Content-Type: application/json 

    {
        "id": "MRQJ9O4",
        "decoded": 1,
        "minLength": 7,
        "alphabet": "36u"
    }

## Choosing the right minLength and alphabet

Valid alphabet values are: **62**, **36u**, **36l**.

62 (BASE62)

    abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890

36u (BASE36 Uppercase)

    ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890

36l (BASE36 Lowercase)

    abcdefghijklmnopqrstuvwxyz1234567890

When choosing minLength and alphabet, consider the following:

* With alphabet **BASE62** and minLength **8**, there are *319,277,809,663* unique hashids before length jumps to **9**.
* With alphabet **BASE36** and minLength **7**, there are *191,102,975* unique hashids before length jumps to **8**.

## Connect with [Amazon API Gateway](https://aws.amazon.com/api-gateway/)

After connecting this lambda function with API gateway endpoint:

### Add stage variable

Add a *table* stage variable and set DynamoDB table name as value.

For example:

| Name    |    Value    |
| :----   | :-------:   |
| table   |  hashid-DEV |

### Configure Integration Request

Add a mapping template with Content-Type **application/json**:

    #set($inputRoot = $input.path('$'))
    {
        "table": "$stageVariables.table",
        "name": $input.json('$.name'),
        "minLength": $input.json('$.minLength'),
        "alphabet": $input.json('$.alphabet')
    }

### Configure Integration Response

Set Lambda Error Regex to *empty* when Method response status is **200**.

Set Lambda Error Regex to **.+** when Method response status is **400**.

Add a mapping template with Content-Type **application/json** when Method response status is **400**:

    #set($inputRoot = $input.path('$'))
    {
      "message" : $input.json('$.errorMessage')
    }
