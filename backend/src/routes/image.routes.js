import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import { uploadItemImages } from "../controllers/image.controller.js";

const router = Router();

router.use(jwtVerify);

router.route("/item/:itemId").post(upload.array("images", 5), uploadItemImages);

export default router;