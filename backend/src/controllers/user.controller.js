import bcrypt from "bcrypt"
import { asyncHandler } from "../utils/asyncHandler.js";
import { createUser, findUserByEmail, findUserById, removeRefreshToken, updatePassword, updateUserProfile } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { hashPassword, isPasswordCorrect, isPasswordCorrect} from "../utils/password.util.js"
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.util.js";
import { updateRefreshToken } from "../models/user.model.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req, res)=>{
    const {full_name, email, password, phone, address, city } =req.body

    if([email, password, full_name].some((field)=>{field?.trim() === ""})) {
        throw new apiError(400, "Full name , email and password are required")
    }

    if(
        !email.includes("@") ||
        !email.includes(".")||
        email.startsWith("(@") ||
        email.endsWith("@")
    ) {
        throw new apiError(400, "invalid email format")
    }

    const existingUser = await findUserByEmail(email)
    console.log(existingUser)
    
    if(existingUser) {
        throw new apiError(400, "Email already taken....!")
    }

    const  password_hash = await hashPassword(password)

    const result = await createUser({
        full_name, 
        email,
        password_hash,
        phone,
        address,
        city
    })

    res
    .status(200)
    .json(
        new apiResponse(200, result, "User registered successfully")
    )


})

const loginUser= asyncHandler(async(req, res)=>{
    
    const { email, password }= req.body

    if(!email || !password) {
        throw new apiError(400, "Email and password are requird")
    }

    const user = await findUserByEmail(email)

    if(!email){
        throw new apiError(404, "User not found")
    }

     if(!password) {
      throw new apiError(400, "Password is required")
   }

   const checkedPassword = await isPasswordCorrect(password, user.password_hash)

   if(!checkedPassword) {
    throw new apiError(401, "Invalid Password")
   }

   const accessToken= await generateAccessToken(user)
   const refreshToken = await generateRefreshToken(user)

   await updateRefreshToken(user.user_id, refreshToken)
   
   res
   .status(200)
   .cookie("accessToken", accessToken, { httpOnly: true, secure: true})
   .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true})
   .json(
    new apiResponse(200, {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name
    }, "Login Successful")
   )

})

const logoutUser = asyncHandler(async(req, res)=> {
    const { user_id }= req.user

    await removeRefreshToken(user_id)

    res
    .cleaCookie("accessToken", { httpOnly : true, secure: true })
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .json(
        new apiResponse(200, {}, "Logged out successfully")
    )
})

const getCurrentUser = asyncHandler(async(req, res)=>{
    const userId= req.user.userId

    const user = await findUserById(userId)

    if(!user) {
         throw new apiError(404 ,"User not Found")
    }

    res
    .status(200)
    .json(
        new apiResponse(200, {
            userId: user.user_id,
            fullName: user.full_name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            city: user.city,
            avatarUrl: user.avatar_url
        }, "User fetched Successfully")
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

    const user = await findUserById(decodedRefreshToken.user_id)

    if(!user || user.refresh_token !== someRefreshToken) {
        throw new apiError(401, "invalid refresh TOken")
    }

    const newAccessToken = await generateRefreshToken(user)

    res
    .status(200)
    .cookie("accessToken", newAccessToken, {httpOnly: true, secure: true})
    .json(
        new apiResponse(200, {newAccessToken}, "Access Token refreshed")
    )
})

const changePassword = asyncHandler(async (req, res)=> {
    const { password , newPassword }= req.body
    const user_id  = req.user?.user_id 

    const user = await findUserById(user_id)

    if(!user) {
        throw new apiError(404, "User not found")
    }

    const isPasswordCorrect = await isPasswordCorrect(password, newPassword)

    if(!isPasswordCorrect){
        throw new apiError(400, "invalid old password")
    }

    const newPassword_hash = await hashPassword(newPassword) 

    await updatePassword(user.userId ,newPassword_hash)

    res
    .status(200)
    .json(
        new apiResponse(200, {}, "Password Updated successfully")
    )
})

const updateProfile = asyncHandler(async(req, res)=>{
    const { full_name, city, phone , address } = req.body
    const userId = req.user.userId;

    await updateUserProfile(userId , {
        full_name,
        city,
        phone,
        address
    })

    res
    .status(200)
    .json(
        new apiResponse(200, {}, "Profile updated successfull")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser, 
    changePassword,
    updateProfile,
    getCurrentUser,
    refreshAccessToken
}