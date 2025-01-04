/*import connectDB from "./db/index.js";
import { config } from 'dotenv';
import { app } from "./app.js";

config(); // This loads all environment variables

const PORT = process.env.PORT || 8000;
const MONGODB_URL = process.env.MONGODB_URL; // Use environment variable

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

connectDB()
.then(PORT,()=>{
    app.listen(PORT, () =>{
        console.log("Server is running.")
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed : ",err);
})
*/

/*The Issue
The then() method in a Promise takes a function as its first argument. However, you're passing PORT as the first argument, which is incorrect. This will likely cause unexpected behavior.

The connectDB function is asynchronous and uses mongoose.connect, which returns a Promise. You need to ensure that the app.listen call happens only after the database connection is successfully established.

 */

import connectDB from "./db/index.js";
import { config } from "dotenv";
import { app } from "./app.js";

config(); // This loads all environment variables

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Start the server only if the database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1); // Exit with a failure code
  }
};

startServer();

