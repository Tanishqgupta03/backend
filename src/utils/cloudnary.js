import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary = async (localFilePath) => {
    console.log("Inside uploadCloudinary function");
    
    try {
        console.log("Local file path provided:", localFilePath);
        if (!localFilePath) {
            console.error("No local file path provided");
            return null;
        }
        
        // Check if the file exists before uploading
        if (!fs.existsSync(localFilePath)) {
            console.error("File does not exist at the path:", localFilePath);
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("Uploaded response: ", response);
        fs.unlinkSync(localFilePath); // Remove local file if it exists
        return response; 
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        if (localFilePath) {
            fs.unlinkSync(localFilePath); // Remove local file if it exists
        }
        return null;
    }
};

export { uploadCloudinary };