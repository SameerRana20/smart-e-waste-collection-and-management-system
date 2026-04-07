import express from "express"
import {
         
         loginAdmin, 
         logoutAdmin, 
         changePassword,
         updateProfile,
         getCurrentAdmin,
         refreshAccessToken,
         updateAvatar,
         getDashboardStats,
         getAllCollectorsAdmin,
         getAllRequestsDetailedAdmin,
         getAllRequestsAdmin,
         approveCollector,
         rejectCollector,
         getPendingCollectorsAdmin
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

router.patch("/collector/:id/approve",  approveCollector);

router.patch("/collector/:id/reject", rejectCollector);

router.get("/requests",  getAllRequestsAdmin);

router.get("/dashboard", getDashboardStats);

router.get("/collectors", getAllCollectorsAdmin);

router.get("/requests-detailed", getAllRequestsDetailedAdmin);

router.get("/collectors/pending",  getPendingCollectorsAdmin);

export default router