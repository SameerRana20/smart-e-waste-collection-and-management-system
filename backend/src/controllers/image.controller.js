import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { addImageToItem } from "../models/request.model.js";


const uploadItemImages = asyncHandler(async (req, res) => {

  const itemId = req.params.itemId;

  if (!req.files || req.files.length === 0) {
    throw new apiError(400, "No images uploaded");
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