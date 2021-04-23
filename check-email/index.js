const {MongoClient, Db} = require('mongodb');
const uri = "mongodb+srv://kit90099:chben1234@cluster0.fgdhb.mongodb.net/fyp_db?retryWrites=true&w=majority";

exports.handler = async (event,context,callback) => {
    context.callbackWaitsForEmptyEventLoop=false;

    const client = new MongoClient(uri, {useUnifiedTopology: true });
    
    try{
        await client.connect();
        
        const collection=client.db().collection("userdata");
        const query = {"email" : event.email};
        const options = { projection : {_id:0,userName:0,name:0,nickname:0,birthdate:0,email:0,phoneNumber:0,paymentPassword:0,"userId":0,"saving":0,"nonce":0},};
        const user = await collection.findOne(query,options);
        client.close();
        
        if(user != null){
            return {
                statusCode : 200,
                "available":false
            };
        }else{
            return {
                statusCode : 200,
                "available":true
            };
        }
        
    }catch(error){
        console.log("error: "+error);
        client.close();
        
        const response = {
        statusCode: 404,
        warning: JSON.stringify('No user with username '+event.userName+" found"),
    };
    return response;
    }
    
    /*
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
    */
};
