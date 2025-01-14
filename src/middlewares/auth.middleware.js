import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try{
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer", "")

        //ya to cookies se token nikal lo ya fir header se aga rkisi user ne manually bheja ho to

        if(!token){
            throw new ApiError(401, "Unauthorizes request")
        }

        //agr token mil gaya ab usko verify to karana hoga 
        //info nikalni hogi 

        /*return jwt.sign({//already db m save h aur this k andr access h 
                _id: this._id,
                email: this.email,
                username: this.username,
                fullName: this.fullName
            }, */

            //ye sb dala tha.

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next();
    }catch(error){
        throw new ApiError(401, "Invalid Access Token")
    }

    //dekho signout k function pr hamare paas user ki info nhi thi signout krne k liye isilye ab hum req m inject kr rahe ye user info 

})