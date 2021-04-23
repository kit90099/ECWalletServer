const {MongoClient, Db} = require('mongodb');
const uri = "mongodb+srv://kit90099:chben1234@cluster0.fgdhb.mongodb.net/fyp_db?retryWrites=true&w=majority";
const crypto = require("crypto");

exports.handler = async (event) => {
    const nonce = getRandomInt(9999999999);
    
    const client = new MongoClient(uri, {useUnifiedTopology: true });
    try{
        await client.connect();
        
        const collection=client.db().collection("userdata");
        const filter = {"userName" : event.userName};
        
        const updateDoc = {
          $set: {
            "nonce":nonce
          },
        };
        
        const res = await collection.updateOne(filter, updateDoc);
        
        console.log(event.userName+" "+nonce+" "+res.matchedCount);
        if(res.matchedCount == 0){
            return {
                statusCode : 406,
                warning : "can't update db!"
            };
        }
        
        const user = await collection.findOne(filter);
        const userId = user.userId;
        
        const hash = crypto.createHash("sha256");
        hash.update(userId);
        const digested = hash.digest();
        
        const hmac = crypto.createHmac("sha256",digested);
        const updated = hmac.update(String(nonce));
        const sign = updated.digest("base64");
        
        const response = {
            statusCode: 200,
            "nonce": nonce,
            "hmac":sign
        };
        
        return response;
    }catch(error){
        console.log("error: "+error);
        client.close();
        
        const response = {
        statusCode: 404,
        warning: JSON.stringify('No user with username '+event.userName+" found"),
    };
    return response;
    }
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}