import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // file system nide js k sath milta h
import { console } from "inspector";


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        //upload the file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully
        console.log("response of saved : ",response);
        console.log("file is uploaded successfully : ",response.url)
        return response;
    }catch(error){
        //ab jo bhi uploadCloudinary function ko use kr raha h iska mtlb h local m file to h tb upload kyun nhi hui kuch issue h 
        // to file hta do local se 

        fs.unlinkSync(localFilePath) // isko async nhi banana kyunki hum chahate hein ki ye kaam to hona hi chaie
        return null;
    }
}


export {uploadCloudinary}