import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";

import {
  createEwasteRequest,
  getMyRequests,
  getSingleRequests,
  deleteUserRequest,
  getRequestStats
} from "../controllers/request.controller.js";

const router = Router();


// ===================== Protected Routes ====================

router.use(jwtVerify);

router.route("/").post(createEwasteRequest);

router.route("/stats").get(getRequestStats);

// get all user requests
router.route("/my").get(getMyRequests);

// get single request
router.route("/:id").get(getSingleRequests);

// delete request (only if collector not assigned)
router.route("/:id").delete(deleteUserRequest);

 


export default router;