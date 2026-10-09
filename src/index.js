//require('dotenv').config({path: './env'}) - commonjs syntax
import dotenv from "dotenv"
import connectDB from "./db/db.js";

dotenv.config({
    path: "./.env"
})
 
connectDB() // - the db connection was a async process, so once the async function finished , it returns a promise. .then and .catch is a promise.

.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.error("MONGODB connection failed !!", err);
})





/*
(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("Errr: ", error)
            throw error
        })

        app.listen(process.env.PORT, () =>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    }
    catch(error){
        console.error("Error: ", error)
        throw err
    }
})()
*/