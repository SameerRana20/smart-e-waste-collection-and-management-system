import express from "express"
import {
         
         loginAdmin, 
         logoutAdmin, 
         changePassword,
         updateProfile,
         getCurrentAdmin,
         refreshAccessToken,
         updateAvatar
        } from "../controllers/admin.controller.js"
 
import { jwtVerify } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = express.Router()

router.route("/login").post(loginAdmin)

router.route("/refresh-token").post(refreshAccessToken)

//========================Protected Routes===================
router.use(jwtVerify)

router.route("/logout").post(logoutAdmin)

router.route("/change-password").patch(changePassword)

router.route("/profile").patch(updateProfile)

router.route("/me").get(getCurrentAdmin)

router.route("/avatar").patch(upload.single("avatar"),  updateAvatar)

export default router