import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"


const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL)

        console.log(`\n mongodb connected ${connectionInstance.connection.host}`)
    } catch(error){
        console.log("MongoDB Connection error", error);
        process.exit(1);
    }
}

export default connectDB;