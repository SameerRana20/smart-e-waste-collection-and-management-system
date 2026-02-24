import  express from "express"
import { jwtVerify } from "../middlewares/auth.middleware"
import {   
        registerCollector,
        loginCollector,
        logoutCollector,
        getCollectorProfile,
        refreshAccessToken,
        changePassword
} from "../controllers/collector.controller.js"

 
const router = express.Router()

router.route("/register").post(registerCollector)

router.route("/login").post(loginCollector)

router.route("/refresh_token").post(refreshAccessToken)


//====================== Protected Routes ====================

router.use(jwtVerify)

router.route("/logout").post(logoutCollector)

router.route("/me").get(getCollectorProfile)

router.route("/change-password").patch(changePassword)

export default router

