const mongoose = require("mongoose");
//mongodb uri
const MONGOURI = "MongoDB URI"

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
