import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

import {
    createCollector,
    findCollectorByEmail,
    findCollectorById,
    updateCollectorRefreshToken,
    removeCollectorRefreshToken,
    updateCollectorPassword
} from "../models/collector.model.js";

import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/jwt.util.js";

import { hashPassword,isPasswordCorrect } from "../utils/password.util.js";


const registerCollector = asyncHandler(async (req, res) => {

    const {
        fullName,
        email,
        password,
        phone,
        city,
        vehicleNumber,
        organizationName
    } = req.body

    if (!fullName || !email || !password || !phone || !city || !vehicleNumber || !organizationName) {

        throw new apiError(400, "All fields are required")
    }

    if(
        !email.includes("@") ||
        !email.includes(".")||
        email.startsWith("(@") ||
        email.endsWith("@")
    ) {
        throw new apiError(400, "invalid email format")
    }

    const existingCollector = await findCollectorByEmail(email)

    if (existingCollector) {
        throw new apiError(400, "Collector already exists")
    }

     const  passwordHash = await hashPassword(password)

   const result = await createCollector({
        full_name: fullName,
        email,
        password_hash: passwordHash,
        phone,
        city,
        vehicle_number: vehicleNumber,
        organization_name: organizationName
    });

    res.status(200).json(
        new apiResponse(200, result, "Collector registered successfully. Awaiting admin approval.")
    );

})

const loginCollector = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if(!email || !password) {
        throw new apiError(400, "Email and password are requird")
    }

    const collector = await findCollectorByEmail(email);

    if (!collector) {
        throw new apiError(404, "Collector not found");
    }

    if(!password) {
      throw new apiError(400, "Password is required")
   }

    if (collector.verification_status !== "approved") {
        throw new apiError(403, "Collector not approved yet");
    }

    const isPasswordCorrect = await bcrypt.compare( password, collector.password_hash);

    if (!isPasswordCorrect) {
        throw new apiError(401, "Invalid credentials");
    }

    const accessToken =await generateAccessToken({
        user_id: collector.collector_id,
        email: collector.email
    });

    const refreshToken = await generateRefreshToken({
        user_id: collector.collector_id
    });

    

    await updateCollectorRefreshToken(
        collector.collector_id,
        refreshToken
    );

     res
   .status(200)
   .cookie("accessToken", accessToken, { httpOnly: true, secure: true})
   .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true})
   .json(
       new apiResponse(
           200,
           {
               collectorId: collector.collector_id,
               fullName: collector.full_name,
               email: collector.email,
               city: collector.city
           },
           "Collector logged in successfully"
       )
   );

})

const logoutCollector = asyncHandler(async (req, res) => {

    const collectorId = req.user.userId;

    await removeCollectorRefreshToken(collectorId);

    res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(200)
        .json(
            new apiResponse(200, {}, "Collector logged out successfully")
        );

})

const getCollectorProfile = asyncHandler(async (req, res) => {

    const collectorId = req.user.userId;

    const collector = await findCollectorById(collectorId);

    if (!collector) {
        throw new apiError(404, "Collector not found");
    }

    res.status(200).json(
        new apiResponse(
            200,
            {
                collectorId: collector.collector_id,
                fullName: collector.full_name,
                email: collector.email,
                phone: collector.phone,
                city: collector.city,
                vehicleNumber: collector.vehicle_number,
                organizationName: collector.organization_name,
                verificationStatus: collector.verification_status
            },
            "Collector profile fetched successfully"
        )
    );

})

const refreshAccessToken = asyncHandler(async(req, res)=> {
    const incomingRefreshToken = req.cookies?.refreshToken

    if(!incomingRefreshToken) {
        throw new apiError(400, "Refresh Token missing")
    }

    const decoded =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const collector = await findCollectorById(decoded.userId)

    if (!collector || collector.refresh_token !== incomingRefreshToken) {
        throw new apiError(400, "invalid Refresh TOken")
    }

    const newAccessToken = await generateAccessToken({
        user_id : collector.user_id,
        email: collector.email
    })

    res 
        .cookie("accessToken" , newAccessToken, { httpOnly:true, secure: true })
        .status(200)
        .json(
            new apiResponse(200, {newAccessToken}, "Access Token refreshed")
        )

})

const changePassword = asyncHandler(async (req, res) => {
    const { password, newPassword } = req.body
    const collectorId = req.user?.userId

    if(!password?.trim() || !newPassword?.trim()) {
        throw new apiError(400, "Old and new password are required");
    }

    const collector = await findCollectorById(collectorId);

    if(!collector) {
        throw new apiError(404, "User not found");
    }

    const isMatch = await isPasswordCorrect(password, collector.password_hash);

    if(!isMatch) {
        throw new apiError(400, "Invalid old password");
    }

    const newPasswordHash = await hashPassword(newPassword);

    const result = await updateCollectorPassword(collector.collector_id, newPasswordHash);

    if(result.affectedRows === 0) {
        throw new apiError(500, "Password update failed");
    }

    await removeCollectorRefreshToken(collector.collector_id)

    res
        .clearCookie("accessToken", { httpOnly: true, secure: true })
        .clearCookie("refreshToken", { httpOnly: true, secure: true })
        .status(200)
        .json(
            new apiResponse(200, {}, "Password updated successfully. Please login again.")
        );
})





export {
    registerCollector,
    loginCollector,
    logoutCollector,
    getCollectorProfile,
    refreshAccessToken,
    changePassword
}