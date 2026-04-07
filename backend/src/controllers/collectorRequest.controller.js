import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { connection } from "../db/db.js";

import {
  getCollectorRequests,
  getRequestById,
  updateRequestStatus,
  createPickupActivity,
  markPickupCompleted,
  createDisposition,
  getRequestWithItemsAndImages
} from "../models/request.model.js";

import { addRewardPoints } from "../models/user.model.js";


const getAssignedRequests = asyncHandler(async (req, res) => {

  const collectorId = req.user.userId;

  const requests = await getCollectorRequests(collectorId);

  res.status(200).json(
    new apiResponse(200, requests, "Assigned requests fetched")
  );
});


const approveRequest = asyncHandler(async (req, res) => {

  const collectorId = req.user.userId;
  const requestId = req.params.id;
  const { scheduledDate } = req.body;

  if (!scheduledDate) {
    throw new apiError(400, "Scheduled date is required");
  }

  const request = await getRequestById(requestId);

  if (!request) {
    throw new apiError(404, "Request not found");
  }

  if (request.assigned_collector_id !== collectorId) {
    throw new apiError(403, "Not authorized");
  }

  if (request.status !== "pending") {
    throw new apiError(400, "Request cannot be approved");
  }

  const conn = await connection.getConnection();

  try {

    await conn.beginTransaction();

    await updateRequestStatus(requestId, "assigned", conn);

    await createPickupActivity(requestId, collectorId, scheduledDate, conn);

    await conn.commit();

  } catch (error) {

    await conn.rollback();
    throw new apiError(500, "Approval failed");

  } finally {
    conn.release();
  }

  res.status(200).json(
    new apiResponse(200, {}, "Request approved and pickup scheduled")
  );
});


const rejectRequest = asyncHandler(async (req, res) => {

  const collectorId = req.user.userId;
  const requestId = req.params.id;

  const request = await getRequestById(requestId);

  if (!request) {
    throw new apiError(404, "Request not found");
  }

  if (request.assigned_collector_id !== collectorId) {
    throw new apiError(403, "Not authorized");
  }

  if (request.status !== "pending") {
    throw new apiError(400, "Request cannot be rejected");
  }

  await updateRequestStatus(requestId, "cancelled");

  res.status(200).json(
    new apiResponse(200, {}, "Request rejected successfully")
  );
});


const completePickup = asyncHandler(async (req, res) => {

  const collectorId = req.user.userId;
  const requestId = req.params.id;

  const request = await getRequestById(requestId);

  if (!request) {
    throw new apiError(404, "Request not found");
  }

  if (request.assigned_collector_id !== collectorId) {
    throw new apiError(403, "Not authorized");
  }

  if (request.status !== "assigned") {
    throw new apiError(400, "Only assigned requests can be picked up");
  }

  await markPickupCompleted(requestId);

  res.status(200).json(
    new apiResponse(200, {}, "Pickup marked as completed")
  );
});


const recordDisposition = asyncHandler(async (req, res) => {

  const collectorId = req.user.userId;
  const requestId = req.params.id;
  const { dispositionType, remarks } = req.body;

  if (!dispositionType) {
    throw new apiError(400, "Disposition type is required");
  }

  const request = await getRequestById(requestId);

  if (!request) {
    throw new apiError(404, "Request not found");
  }

  if (request.assigned_collector_id !== collectorId) {
    throw new apiError(403, "Not authorized");
  }

  if (request.status !== "assigned") {
    throw new apiError(400, "Request not ready");
  }

  let points = 0;
  if (dispositionType === "recycled") points = 100;
  else if (dispositionType === "reused") points = 70;
  else if (dispositionType === "disposed") points = 50;

  const conn = await connection.getConnection();

  try {

    await conn.beginTransaction();

    await createDisposition(
      requestId,
      collectorId,
      dispositionType,
      remarks || null,
      conn
    );

    await updateRequestStatus(requestId, "completed", conn);

    await addRewardPoints(request.user_id, points, conn);

    await conn.commit();

  } catch (error) {

    await conn.rollback();
    throw new apiError(500, "Transaction failed");

  } finally {
    conn.release();
  }

  res.status(200).json(
    new apiResponse(200, {}, "Disposition recorded successfully")
  );
});


const getSingleRequestDetailed = asyncHandler(async (req, res) => {

  const collectorId = req.user.userId;
  const requestId = req.params.id;

  const request = await getRequestWithItemsAndImages(requestId);

  if (!request) {
    throw new apiError(404, "Request not found");
  }

  if (request.assigned_collector_id !== collectorId) {
    throw new apiError(403, "Not authorized");
  }

  res.status(200).json(
    new apiResponse(200, request, "Request details fetched")
  );
});


export {
  getAssignedRequests,
  approveRequest,
  rejectRequest,
  completePickup,
  recordDisposition,
  getSingleRequestDetailed
};