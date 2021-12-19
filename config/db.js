const mongoose = require("mongoose");
//mongodb uri
const MONGOURI = "mongodb+srv://algo:algo@cluster0.g6kzb.mongodb.net/Todo-app?retryWrites=true&w=majority"

const InitiateMongoServer = async () => {
    try{
        await mongoose.connect(MONGOURI, {
            useNewUrlParser: true
        });
        console.log("Connected to DB!!");
    } catch (e){
        console.log(e);
        throw e;
    }
}

module.exports = InitiateMongoServer;