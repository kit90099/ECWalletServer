const {MongoClient, Db} = require('mongodb');
const uri = "mongodb+srv://kit90099:chben1234@cluster0.fgdhb.mongodb.net/fyp_db?retryWrites=true&w=majority";

exports.handler = async (event,context,callback) => {
    context.callbackWaitsForEmptyEventLoop=false;
    console.log("username: "+event.userName)

    const client = new MongoClient(uri, {useUnifiedTopology: true });
    
    try{
        const client = new MongoClient(uri, {useUnifiedTopology: true });
        await client.connect();
        
        const collection=client.db().collection("userdata");
        const query = {"userName" : event.userName};
        const options = { projection : {_id:0,userName:0,name:0,nickname:0,birthdate:0,email:0,phoneNumber:0,paymentPassword:0},};
        const saving = await collection.findOne(query,options);
        
        const response = {
            statusCode: 200,
            saving: saving.saving,
        };
        
        return response
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
