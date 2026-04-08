import bcrypt from "bcrypt"
import { asyncHandler } from "../utils/asyncHandler.js";
import {  findAdminByUsername, findAdminById, removeAdminRefreshToken, updatePassword, updateAdminAvatar, updateAdminProfile , getAdminStats} from "../models/admin.model.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { hashPassword, isPasswordCorrect } from "../utils/password.util.js"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util.js";
import { updateAdminRefreshToken } from "../models/admin.model.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken"
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { updateCollectorStatus, getAllCollectors,getPendingCollectors } from "../models/collector.model.js";
import { getAllRequests, getAllRequestsDetailed } from "../models/request.model.js";
 

const loginAdmin= asyncHandler(async(req, res)=>{
    
    const { username, password }= req.body

    if(!username ||  !password) {
        throw new apiError(400, "all fields required")
    }

    const Admin = await findAdminByUsername(username)

    if(!Admin){
        throw new apiError(404, "Admin not found")
    }

  

     if(!password) {
      throw new apiError(400, "Password is required")
   }


const isPasswordCorrect = await bcrypt.compare( password, Admin.password_hash);

    if (!isPasswordCorrect) {
        throw new apiError(401, "Invalid credentials");
    }
    const accessToken =await generateAccessToken({
        user_id: Admin.admin_id,
        email: Admin.username
    });

    const refreshToken = await generateRefreshToken({
        user_id: Admin.admin_id
    });

    

    await updateAdminRefreshToken(
        Admin.admin_id,
        refreshToken
    );
   
   res
   .status(200)
   .cookie("accessToken", accessToken, { httpOnly: true, secure: false})
   .cookie("refreshToken", refreshToken, { httpOnly: true, secure: false})
   .json(
    new apiResponse(200, {
        AdminId: Admin.admin_id,
        username: Admin.username,
        fullName: Admin.full_name
    }, "Login Successful")
   )

})

const logoutAdmin = asyncHandler(async(req, res)=> {
    const  Admin_id =  req.user.userId;

    await removeAdminRefreshToken(Admin_id)

    res
    .clearCookie("accessToken", { httpOnly : true, secure: false  })
    .clearCookie("refreshToken", { httpOnly: true, secure: false })
    .json(
        new apiResponse(200, {}, "Logged out successfully")
    )
})

const getCurrentAdmin = asyncHandler(async(req, res)=>{
    const AdminId=  req.user.userId

    const Admin = await findAdminById(AdminId)

    if(!Admin) {
         throw new apiError(404 ,"Admin not Found")
    }

    res
    .status(200)
    .json(
        new apiResponse(200, {
            AdminId: Admin.admin_id,
            fullName: Admin.full_name,
            phone: Admin.phone,
            address: Admin.address,
            city: Admin.city,
            avatarUrl: Admin.avatar_url
        }, "Admin fetched Successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const someRefreshToken= req.cookies?.refreshToken

    if(!someRefreshToken) {
        throw new apiError(401, "refresh Token missing")
    }

    const decodedRefreshToken =  jwt.verify(
        someRefreshToken,
         process.env.REFRESH_TOKEN_SECRET)

    const Admin = await findAdminById(decodedRefreshToken.userId)

    if(!Admin || Admin.refresh_token !== someRefreshToken) {
        throw new apiError(401, "invalid refresh TOken")
    }

    const newAccessToken = await generateAccessToken(Admin)

    res
    .status(200)
    .cookie("accessToken", newAccessToken, {httpOnly: true, secure: false})
    .json(
        new apiResponse(200, {newAccessToken}, "Access Token refreshed")
    )
})

const changePassword = asyncHandler(async (req, res) => {
    const { password, newPassword } = req.body;
   const AdminId = req.user?.userId;   

    if (!password?.trim() || !newPassword?.trim()) {
        throw new apiError(400, "Old and new password are required");
    }

    const Admin = await findAdminById(AdminId);

    if (!Admin) {
        throw new apiError(404, "Admin not found");
    }


    const isMatch = await bcrypt.compare(password, Admin.password_hash);

    if (!isMatch) {
        throw new apiError(401, "Invalid Password");
    }

  const newPasswordHash = await hashPassword(newPassword);

const result = await updatePassword(Admin.admin_id, newPasswordHash);

    if (result.affectedRows === 0) {
        throw new apiError(500, "Password update failed");
    }

  
    await removeAdminRefreshToken(Admin.admin_id);

  
    res
        .clearCookie("accessToken", { httpOnly: true, secure: false })
        .clearCookie("refreshToken", { httpOnly: true, secure: false })
        .status(200)
        .json(
            new apiResponse(200, {}, "Password updated successfully. Please login again.")
        );
});

 
const updateProfile = asyncHandler(async(req, res)=>{
    const { full_name } = req.body
    const AdminId = req.user.userId;

    if(!full_name) {
        throw new apiError(400, "full name is required")
    }

    await updateAdminProfile(AdminId , full_name)

    res
    .status(200)
    .json(
        new apiResponse(200, { full_name}, "Profile updated successfull")
    )
})

const updateAvatar = asyncHandler(async(req, res)=>{
    const AdminId = req.user.userId

   const avatarPath = req.file?.path

    if(!avatarPath) {
        throw new apiError(400, "avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarPath)

    if(!avatar.url) {
        throw new apiError(200, "Error while uploading avatar")
    }

    await updateAdminAvatar(AdminId, avatar.url)

    res
    .status(200)
    .json(
        new apiResponse(200, { avatar }, "avatar updated successfully")
    )
})

const approveCollector = asyncHandler(async (req, res) => {

  await updateCollectorStatus(req.params.id, "approved");

  res.status(200).json(
    new apiResponse(200, {}, "Collector approved")
  );
});

const rejectCollector = asyncHandler(async (req, res) => {

  await updateCollectorStatus(req.params.id, "rejected");

  res.status(200).json(
    new apiResponse(200, {}, "Collector rejected")
  );
});

const getAllRequestsAdmin = asyncHandler(async (req, res) => {

  const requests = await getAllRequests();

  res.status(200).json(
    new apiResponse(200, requests, "All requests fetched")
  );
});

const getDashboardStats = asyncHandler(async (req, res) => {

  const stats = await getAdminStats();

  res.status(200).json(
    new apiResponse(200, stats, "Dashboard stats fetched")
  );
});

const getAllCollectorsAdmin = asyncHandler(async (req, res) => {

  const collectors = await getAllCollectors();

  res.status(200).json(
    new apiResponse(200, collectors, "Collectors fetched")
  );
});

const getAllRequestsDetailedAdmin = asyncHandler(async (req, res) => {

  const requests = await getAllRequestsDetailed();

  res.status(200).json(
    new apiResponse(200, requests, "Detailed requests fetched")
  );
});

const getPendingCollectorsAdmin = asyncHandler(async (req, res) => {

  const collectors = await getPendingCollectors();

  res.status(200).json(
    new apiResponse(200, collectors, "Pending collectors fetched")
  );
});

export {  
    loginAdmin,
    logoutAdmin, 
    changePassword,
    updateProfile,
    getCurrentAdmin,
    refreshAccessToken,
    updateAvatar,
    getAllRequestsAdmin,
    approveCollector,
    rejectCollector,
    getDashboardStats,
    getAllCollectorsAdmin,
    getAllRequestsDetailedAdmin,
    getPendingCollectorsAdmin
}