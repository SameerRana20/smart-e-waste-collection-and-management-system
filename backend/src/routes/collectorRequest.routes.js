import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";

import {
  getAssignedRequests,
  approveRequest,
  rejectRequest,
  completePickup,
  recordDisposition
} from "../controllers/collectorRequest.controller.js";

const router = Router();

router.use(jwtVerify);

router.route("/requests").get(getAssignedRequests);

router.route("/request/:id/approve").patch(approveRequest);

router.route("/request/:id/reject").patch(rejectRequest);

router.route("/request/:id/pickup").patch(completePickup);

router.route("/request/:id/disposition").post(recordDisposition);

export default router;