# hashid-lambda

A simple AWS Lambda function that generates hashid with DynamoDB atomic counter.

Inspired by [hashids](http://hashids.org/).


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
