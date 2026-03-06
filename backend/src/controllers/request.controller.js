import { asyncHandler } from "../utils/asyncHandler.js";

import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

import { createRequest,
         addItemToRequest,
         getUserRequests,
         getRequestById,
         findCollectorByCity,
         deleteRequest
        } from "../models/request.model.js";

import { findUserById } from "../models/user.model.js";


const createEwasteRequest = asyncHandler(async(req,res)=>{
    
    const userId = req.user.userId
    const { items } = req.body

    if(!items || items === 0 ) {
        throw new apiError(400, "Items are required")
    }
         
    const user = await findUserById(userId)

    if(!user) {
        throw new apiError(400, "User not found")
    }
       
    const userCity = user.userCity

    const collector = await findCollectorByCity(userCity)

    if(!collector) {
        throw new apiError(400 , "No collector available in your city")
    }

    const requestId = await createRequest(userId , collector.collector_id)

    //insert items
    for(const item of items) {
        await addItemToRequest(requestId, item)
    }

    res
    .status(200)
    .json(
        new apiResponse(200,{ requestId }, " E-waste request created sucessfully")
    )

})

const getMyRequests = asyncHandler(async(req, res)=>{
    const userId = req.user.userId

    const requests = await getUserRequests(userId)

    res
        .status(200)
        .json(
            new apiResponse(200, requests , "User requests fetched successfully")
        )
})

const getSingleRequests = asyncHandler(async(req, res)=>{
    const userId = req.user.userId
    const requestId = req.params.userId

    const request = await getRequestById(requestId)

    if(!request) {
        throw new apiError(404, "Request not found")
    }

    if(request.user_id !== userId) {
         throw new apiError(403, "not authorized ")
    }

    res
        .status(200)
        json(
            new apiResponse(200, request, "Request fetched successfully")
        )
})


export {
    createEwasteRequest,
    getMyRequests,
    getSingleRequests
}