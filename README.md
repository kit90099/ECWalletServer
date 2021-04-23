# ECWallet server source code

This is the source code of ECWallet's server.

## Getting Started

All these code is written by javascript and they are expected to run on Amazon Lambda.

In this project,the server codes are written to build RESTful API and all the parameter sent to the api should in contained in a json file and sent with the request.

The entry function of the codes in the folders is:

```javascript
exports.handler = function.async(event){
    ...
}
```

## How to run it

You can upload the source code to AWS Lambda and run it.

### Existing Server

There is a server that have been set by me that all the source code is running on the server.

To use the server, please add the folder name after

```link
https://28ya0vu0ve.execute-api.ap-northeast-1.amazonaws.com/test
```

For example, to check the source code in ***check-email*** folder, please enter the following link in the browser.

```link
https://28ya0vu0ve.execute-api.ap-northeast-1.amazonaws.com/test/check-email
```

## Parameters

This is a table for the requiring parameter for every API.

|API|Parameter|
|----|----|
|check-email|email|
|check-phone|phone|
|check-records|userName|
|check-saving|userName|
|check-transactions|user|
|check-username|userName|
|finish-payment|transactionId, payer, payee, amount, gersture|
|get-nonce|userName|
|new-payment|payer, payee, paymentPassword, amount, gesture, hmac|

### Example of request

To send request to check email,please the following json object

```json
{
    "email" : "user@example.com"
}
```

to

```link
https://28ya0vu0ve.execute-api.ap-northeast-1.amazonaws.com/test/check-email
```

## Author

* Cheng Kit Yuen, Benjamin - written for final year project (2020-2021)