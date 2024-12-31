import connectDB from "./db/index.js";
import { config } from 'dotenv';

config(); // This loads all environment variables

const PORT = process.env.PORT || 8000;
const MONGODB_URL = process.env.MONGODB_URL; // Use environment variable

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

connectDB()
.then(PORT,()=>{
    console.log("Server is running.")
})
.catch((err)=>{
    console.log("Mongo db connection failed : ",err);
})

