import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { addImageToItem } from "../models/request.model.js";

import { connection } from "../db/db.js";

const uploadItemImages = asyncHandler(async (req, res) => {

  const userId = req.user.userId;
  const itemId = req.params.itemId;

  if (!req.files || req.files.length === 0) {
    throw new apiError(400, "No images uploaded");
  }

  //  SECURITY CHECK
  const [rows] = await connection.query(
    `SELECT er.user_id
     FROM ewaste_items ei
     JOIN ewaste_requests er ON ei.request_id = er.request_id
     WHERE ei.item_id = ?`,
    [itemId]
  );

  if (rows.length === 0) {
    throw new apiError(404, "Item not found");
  }

  if (rows[0].user_id !== userId) {
    throw new apiError(403, "Not authorized to upload images for this item");
  }

  const imageUrls = [];

  for (const file of req.files) {

    const uploaded = await uploadOnCloudinary(file.path);

    if (!uploaded?.url) {
      throw new apiError(500, "Cloudinary upload failed");
    }

    await addImageToItem(itemId, uploaded.url);

    imageUrls.push(uploaded.url);
  }

  res.status(200).json(
    new apiResponse(200, imageUrls, "Images uploaded successfully")
  );
});

export { uploadItemImages };