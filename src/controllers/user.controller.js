import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generAccessAndRefreshTokens = async(userId) =>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        //ab dekho hum refresh token save karan chaha rahe hein db m 
        //save krte hue db m jo jo required mark h sb pr validation aajayega vo iss time nahi chaie 
        //as ek hi field save kra rahe isiliye use validateBeforeSave


        //ye tokens dono user ko dene hein

        return {accessToken, refreshToken}
    }catch(error){
        throw new ApiError(500, "Something went wrong while generating refresh and access token.")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    // Take user info
    const { username, fullName, email, password } = req.body;
    console.log("Username: ", username, "Email: ", email);

    // Validate required fields
    if ([fullName, email, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required.");
    }

    // Check for existing user
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.");
    }

    // Fetch avatar and cover image local paths from uploaded files
    const avatarLocalPath = req.files?.avatar && req.files.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage && req.files.coverImage[0]?.path;

    console.log("Avatar Local Path: ", avatarLocalPath);
    console.log("Cover Image Local Path: ", coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required.");
    }
    
    // Uploading images to Cloudinary
    const avatar = await uploadCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadCloudinary(coverImageLocalPath) : null;

    console.log("Avatar Upload Result: ", avatar);
    
    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed.");
    }

    // Create the user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // Handling the possibility of a missing cover image
        email,
        password,
        username: username.toLowerCase()
    });

    // Fetch the created user without sensitive information
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while retrieving the registered user.");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully."));
});

const loginUser = asyncHandler(async (req, res) =>{
    const {email, username, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials.")
    }

    const {accessToken, refreshToken} = await generAccessAndRefreshTokens(user._id);

    //now send these token to cookies

    //usse phele socho use login karega to usko back kon kon si info bhejnii h 
    // upr jo humne kra 
    // const user = await User.findOne({
    //     $or: [{username}, {email}]
    // })

    //isse unwanted info bhi aagyi hogi jese password password to user ko nhi bhejna n

    //aur dekhoo important thing humne refreshtoken baad m generate kara, to user m empty h abhi 


    //approach 1 ussi object ko update krdo approach 2 use a new db query 

    //decide which suits project.

    //idhr to db call 

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //cookies

    const options = {// cookies easily modify ho jaati hein frontend se isiliye use 
        //these 2 ab sirf server se hoyengi.
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(//ye json isilye bheja jaa raha h ki kya pta user khud access token refresh token save kran chaha raha ho.
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res)=>{
    //User.findById  lekin id kaha se layein is function k paas h nhi 
    // to middleware use kro.


    //abb middleware use krke inject user in req

    await User.findByIdAndUpdate(
        req.user._id,{
            $set: {
                refreshToken: undefined
            }
        },{
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options)
    .clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "user logged Out"))

})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    //yaha agr user logout ho gaya h tb usko ye route hit krke apne refresh token se new access token generate.
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;//cookie se mila to thk vran kisi ne manual bheja hoga

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try{
        //verify the incomingtoken

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)


        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid Refresh Token.")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired.")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, newRefreshToken} = await generAccessAndRefreshTokens(user._id)

        return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken,options)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken},"Access token refreshed successfully"))
    }catch(error){
        throw new ApiError(401, error?.message || "Invalid refrehs token.")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) =>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id) //req.user?.id middle ware n inject kr hua h
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, {}, "Password Change Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) =>{
    return res.status(200).json(200, req.user, "Current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName, email} = req.body;

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?.id,
    {
        $set: {
            fullName,
            email
        }
    },
    {new: true}).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Account Details updated successfully"))
})

//now updating the files 
//files ko update krte hue first middleware multer lagega
//2nd sirf vhi log update kr payenge jo login hon
//to routing krte time dhyan rakhenge.

const updateUserAvatar = asyncHandler(async(req,res)=>{
    // ab dekho hume req.file lena h jo multer se milta h 
    //lekin upr req.files use kra tha kyunki upr array accept kr rahe the contianing the avatar 
    //and the cover image 

    //yaha bs avatar update ho raha h

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error While uploading on avatar.")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {$set:{
        avatar: avatar.url
    }} , {new: true}).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    // ab dekho hume req.file lena h jo multer se milta h 
    //lekin upr req.files use kra tha kyunki upr array accept kr rahe the contianing the avatar 
    //and the cover image 

    //yaha bs avatar update ho raha h

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error While uploading on Cover Image.")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {$set:{
        coverImage: coverImage.url
    }} , {new: true}).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Cover Image updated successfully"))
})

export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage };