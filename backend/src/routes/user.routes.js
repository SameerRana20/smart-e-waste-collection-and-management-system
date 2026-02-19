import express from "express"
import {
         registerUser,
         loginUser, 
         logoutUser, 
         changePassword,
         updateProfile,
         getCurrentUser,
         refreshAccessToken
        } from "../controllers/user.controller.js"
 
import { jwtVerify } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/refresh-token").post(refreshAccessToken)

//========================Protected Routes===================
router.use(jwtVerify)

router.route("/logout").post(logoutUser)

router.route("/change-password").patch(changePassword)

router.route("profile").patch(updateProfile)

router.route("/me").get(getCurrentUser)

export default router