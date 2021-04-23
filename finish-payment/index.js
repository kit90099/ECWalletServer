const {MongoClient, Db} = require('mongodb');
const uri = "mongodb+srv://kit90099:chben1234@cluster0.fgdhb.mongodb.net/fyp_db?retryWrites=true&w=majority";

exports.handler = async function(event){
    const client = new MongoClient(uri, {useUnifiedTopology: true });
    
    try{
        const client = new MongoClient(uri, {useUnifiedTopology: true });
        await client.connect();
        
        const paymentRequests = client.db().collection("paymentRequests");
        
        const queryRecord = {
            "transactionId" : event.transactionId
        };
        
        const record = await paymentRequests.findOne(queryRecord);
        
        if(record.payer != event.payer || record.payee != event.payee || record.amount != event.amount){
            client.close();
            
            return {
                statusCode : 406,
                "warning" : "Information not matched with record!"
            };
        }
        
        if(record.gesture != event.gesture){
            return {
                statusCode : 406,
                "warning" : "Gesture not match!"
            };
        }
        
        // update record
        const updateRecord = {
          $set: {
            "verified":true
          },
        };
        
        const resultRecord = await paymentRequests.updateOne(queryRecord, updateRecord);
        
        if(resultRecord.matchedCount == 0){
            return {
                statusCode : 406,
                "warning" : "Error occurred!"
            };
        }
        
        
        const userdata = client.db().collection("userdata");
        // update  saving
        const savingPayer = await getSaving(userdata,record.payer);
        const savingPayee = await getSaving(userdata,record.payee);
        
        
        const resultPayer = await updateSaving(userdata,record.payer,savingPayer-Number(record.amount));
        const resultPayee = await updateSaving(userdata,record.payee,savingPayee+Number(record.amount));
        
        if(resultPayer == 0 || resultPayee == 0){
            console.log("error: cant update saving");
            
            return {
                statusCode : 406,
                "warning" : "Error occurred. Please contact costumer service"
            };
        }
        
        client.close();
        
        return {
          statusCode : 200,
          "message" : "Payment success!"
        };
        
    }catch(error){
        console.log("error: "+error);
        client.close();
        
        const response = {
            statusCode: 406,
            warning: error,
        };
        
        return response;
    }
};

async function getSaving(collection,user){
    const queryUser = {
        "userName" : user
    };
    const option = {
        "projection" : {
            "saving" : 1
            
        }
    };
    
    const result = await collection.findOne(queryUser,option);
    return result.saving;
}

async function updateSaving(collection,user,amount){
    const filterUser = {
        "userName" : user
    };
    
    const updateRecord = {
          $set: {
            "saving":amount
          },
    };
    
    const resultRecord = await collection.updateOne(filterUser, updateRecord);
    
    return resultRecord.matchedCount;
}

