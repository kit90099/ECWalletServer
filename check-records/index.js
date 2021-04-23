const {MongoClient, Db} = require('mongodb');
const uri = "mongodb+srv://kit90099:chben1234@cluster0.fgdhb.mongodb.net/fyp_db?retryWrites=true&w=majority";

exports.handler = async (event,context,callback) => {
    context.callbackWaitsForEmptyEventLoop=false;
    console.log("username: "+event.userName);

    const client = new MongoClient(uri, {useUnifiedTopology: true });
    
    try{
        const client = new MongoClient(uri, {useUnifiedTopology: true });
        await client.connect();
        
        const collection=client.db().collection("paymentRequests");
        
        const arrRecords = [];

        const queryPayer = {"payer" : event.userName,
            "verified":true
        };
        const options = { projection : {_id:0},};
        const payerRecords = await collection.find(queryPayer,options);
        
        if((await payerRecords.count()) === 0){
            console.log("No payer records found");
        }else{
            await payerRecords.forEach(record=>{
                const time = new Date(record.time);
                record.time = time.toLocaleString("en-US",{"timeZone":"Asia/Hong_Kong","hour12":false});
                arrRecords.push(record);
            });
        }

        const queryPayee = {"payee" : event.userName,
            "verified":true
        };
        const payeeRecords = await collection.find(queryPayee,options);
        
        if((await payeeRecords.count()) === 0){
            console.log("No payee records found");
        }else{
            await payeeRecords.forEach(record=>{
                const time = new Date(record.time);
                record.time = time.toLocaleString("en-US",{"timeZone":"Asia/Hong_Kong",hour12:false});
                arrRecords.push(record);
            });
        }

        console.log(arrRecords);
        
        const response = {
            statusCode:200,
            "paymentRecords":arrRecords,
        };
        
        return response;
        /*
        const response = {
            statusCode: 200,
            saving: saving.saving,
        };
        
        return response*/
    }catch(error){
        console.log("error: "+error);
        client.close();
    }
};
