const {MongoClient, Db} = require('mongodb');
const uri = "mongodb+srv://kit90099:chben1234@cluster0.fgdhb.mongodb.net/fyp_db?retryWrites=true&w=majority";

exports.handler = async (event) => {
    const client = new MongoClient(uri, {useUnifiedTopology: true });
    
    try{
        const client = new MongoClient(uri, {useUnifiedTopology: true });
        await client.connect();
        
        const paymentRequests = client.db().collection("paymentRequests");
        
        const query = {
            "payee" : event.user,
            "verified": false
        };
        const option = {
            "projection" : {
                "transactionId" : 1,
                "payer" : 1,
                "amount" : 1
            }
        };
        const cursor =  paymentRequests.find(query,option);
        
        if ((await cursor.count()) === 0) {
          return {
              statusCode:406,
              message : "No records found"
          };
        }
        
        var records = [];
        await cursor.forEach(function(record){
            records.push(record);
        });
        
        return {
            statusCode : 200,
            "records" : records
        };
    }catch(error){
        console.log("error: "+error);
        client.close();
        
        const response = {
            statusCode: 404,
            warning: JSON.stringify('Server error'),
        };
        
        return response;
    }
};
