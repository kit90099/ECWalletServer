const {MongoClient, Db} = require('mongodb');
const uri = "mongodb+srv://kit90099:chben1234@cluster0.fgdhb.mongodb.net/fyp_db?retryWrites=true&w=majority";
const moment = require("moment-timezone");
const bcrypt = require('bcryptjs');
const rsa = require("node-rsa");
const fs = require("fs");
const crypto = require("crypto")

exports.handler = async (event,context,callback) => {
    /*var random = 0;
    var lastDigit = -1;
    for(var i=0;i<4;i++){
        var digit;
        while(true){
            if((digit = getRandomInt(5)) != lastDigit){
                random = random*10 + digit; 
                lastDigit = digit;
                break;
            }
        }
    
    }*/
    
    var time = moment().tz("Asia/Hong_Kong");
    var transactionId = event.payer + "." + time.format("YYMMDDHHmmss");
    
    const client = new MongoClient(uri, {useUnifiedTopology: true });
    
    try{
        await client.connect();
        
        
        const userdata=client.db().collection("userdata");
        
        const queryPayee = {
            "userName" : event.payee
        };
        
        const payee = await userdata.findOne(queryPayee);
        if(payee == null){
            return {
                statusCode : 406,
                "warning" : "Can not find payee"
            };
        }
        
        const queryPayer = {
            "userName" : event.payer
        };
        const payer = await userdata.findOne(queryPayer);
        
        if(payer.nonce == -1){
            console.log("nonce == -1, sent nonce: "+event.nonce);
            return {
                statusCode : 406,
                "warning" : "Message check failed! Please try again(nonce not match) sent:"+event.nonce
            };
        }
        
        const data = payer.nonce+"|"+event.payer+"|"+event.payee+"|"+event.amount+"|"+event.gesture+"|"+event.paymentPassword+"|"+"ECWallet";
        const pw = payer.userId;
        
        const hash = crypto.createHash("sha256");
        hash.update(pw);
        const digested = hash.digest();
        console.log(digested);
        
        const hmac = crypto.createHmac("sha256",digested);
        const updated = hmac.update(data);
        
        const hashed = updated.digest("base64");
        
        const pass = hashed == event.hmac;
        if(!pass){
            console.log("hmac check failure!");
            return {
                statusCode : 406,
                "warning" : "Message check failed! Please try again(Signiture check failure)"
            };
        }
        
        if(payer.saving < event.amount){
            console.log("No sufficient saving");
            return {
                statusCode : 406,
                "warning" : "No sufficient saving!"
            };
        }
        
        const updateDoc = {
          $set: {
            "nonce":-1,
          },
        };
        
        const resultUpdateNonce = await userdata.updateOne(queryPayer, updateDoc);
        if(resultUpdateNonce.matchedCount == 0){
            return {
                statusCode : 406,
                "warning" : "Database error"
            };
        }
        
        
        const key = fs.readFileSync("/var/task/private.pem", "utf8");
        const privateKey = new rsa(key);
        var decrypted = privateKey.decrypt(event.paymentPassword,"utf8");
        console.log(decrypted);
        if(!bcrypt.compareSync(decrypted,payer.paymentPassword)){
            return {
                statusCode : 406,
                "warning" : "Payment Password not match!"
            };
        }
        
        const collection=client.db().collection("paymentRequests");
        
        const record = {
            "transactionId" : transactionId,
            "time" : time.toISOString(),
            "payer" : event.payer,
            "payee" : event.payee,
            "amount" : event.amount,
            "gesture" : event.gesture,
            "verified" : false
        };
        
        const res = await collection.insertOne(record);
        const result = res.insertedCount;
        
        if(result>0){
            console.log("success!");
            const response = {
                statusCode : 200,
                message : "Request received."
            };
            return response;
        }
    }catch(error){
        console.log("error: "+error);
        client.close();
        
        const response = {
            statusCode: 404,
            warning: JSON.stringify('Error occured!'),
            error:error
        };
        
        return response;
    }
    
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}