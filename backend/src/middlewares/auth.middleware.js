import jwt from "jsonwebtoken"
import { apiError } from "../utils/apiError"

const jwtVerify = async (req, res , next)=> {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token) {
            throw new apiError(401, "Unauthorized Request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if(!decodedToken) {
            throw new apiError(401, "Invalid access Token")
        }

        req.user = decodedToken

        next()

    } catch(error) {
        return next( new apiError(401, "invalid access token"))
    }
}

export { jwtVerify }