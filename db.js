const mongoose = require ('mongoose');
const mongoURI = "mongodb+srv://Vaibhav:Vaibhav123@newcluster.l1nql2g.mongodb.net/iNotebook"
// const mongoURI = process.env.DATABASE

mongoose.set('strictQuery', false);

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connected to Mongo db Successfully")
    })}
module.exports = connectToMongo;