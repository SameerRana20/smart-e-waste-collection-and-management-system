import { connection } from "../db/db.js"

const createRequest = async (userId, collectorId)=> {
    const [result]= await connection.query(
        `INSERT INTO ewaste_requests (user_id, collector_id)
         VALUES (?, ?)`,
        [userId, collectorId]
    )
    return result.insertId
}

const addItemToRequest = async(requestId, item)=> {
    const {itemType , quantity  ,condition} = item

    const [result] = await connection.query(
        `INSERT INTO ewaste_items 
        (request_id, item_type, quantity, condition_desc)
         VALUES (? , ? , ? , ?)`,
        [requestId, itemType, quantity, condition]
    )
    return result.insertId
}

const getUserRequests = async(userId)=>{
    const [rows] = await connection.query(
        `SELECT *
         FROM ewaste_requests
         WHERE user_id = ? 
         ORDER BY request_date DESC`,
         [userId]
    )
    return rows
}

const  getRequestById = async(requestId)=>{
    const [rows]  = await connection.query(
        `SELECT *
         FROM ewaste_requests
         WHERE request_id = ?`,
        [requestId]
    )

    return rows[0]
} 

const findCollectorByCity = async(city)=>{
    const [rows]= await connection.query(
        `SELECT collector_id 
         FROM collectors
         WHERE city = ? 
         verification_status = 'approved'
         LIMIT = 1`,
         [city]
    )

    return  rows[0];
}

const deleteRequest = async (requestId)=>{
    const[result] = await connection.query(
        `DELETE
         FROM ewaste_requests
         WHERE request_id = ? `,
        [requestId]
    )

    return result
}

export {
    createRequest,
    addItemToRequest,
    getUserRequests,
    getRequestById,
    findCollectorByCity,
    deleteRequest
}