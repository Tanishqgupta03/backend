import {Router} from "express"
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js"

import {upload} from "../middlewares/multer.middlewear.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(upload.fields([{
    name: "avatar",
    maxCount: 1
},{
    name:"coverImage",
    maxCount: 1
}]),registerUser)

//to upload ek middleware h fields accept array to array []
//usme files {} avatar aur coverImage.

router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT, logoutUser)


router.route("/refresh-token").post(refreshAccessToken)


export default router