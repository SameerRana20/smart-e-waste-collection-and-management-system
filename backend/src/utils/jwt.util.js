import jwt from "jsonwebtoken"

const generateAccessToken = async (user)=>{
    return jwt.sign({
        userId: user.user_id,
        email: user.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)}

const generateRefreshToken = async (user)=>{
    return jwt.sign({
        userId: user.user_id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)}

export {
    generateAccessToken,
    generateRefreshToken

    
}