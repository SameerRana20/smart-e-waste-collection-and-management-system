import { connection } from "../db/db.js"

const createRequest = async (userId, collectorId)=> {
    const [result]= await connection.query(
        `INSERT INTO ewaste_requests (user_id,  assigned_collector_id)
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
         AND 
         verification_status = 'approved'
         LIMIT 1`,
         [city]
    )

    return  rows[0];
}

const deleteRequest = async (requestId) => {

    const [result] = await connection.query(
        `DELETE FROM ewaste_requests
         WHERE request_id = ?
         AND status = 'pending'`,
        [requestId]
    );

    return result;
};

const getUserRequestStats = async (userId) => {

const [rows] = await connection.query(
    `SELECT 
      COUNT(*) AS total_requests,
      SUM(status = 'pending') AS pending_requests,
      SUM(status = 'assigned') AS assigned_requests,
      SUM(status = 'completed') AS completed_requests
     FROM ewaste_requests
     WHERE user_id = ?`,
    [userId]
  );

  return rows[0];
};

const getCollectorRequests = async (collectorId) => {

  const [rows] = await connection.query(
    `SELECT *
     FROM ewaste_requests
     WHERE assigned_collector_id = ?`,
    [collectorId]
  );

  return rows;
};

const updateRequestStatus = async (requestId, status) => {

  const [result] = await connection.query(
    `UPDATE ewaste_requests
     SET status = ?
     WHERE request_id = ?`,
    [status, requestId]
  );

  return result;
};

const createPickupActivity = async (requestId, collectorId, scheduledDate) => {

  const [result] = await connection.query(
    `INSERT INTO pickup_activity
     (request_id, collector_id, scheduled_date)
     VALUES (?, ?, ?)`,
    [requestId, collectorId, scheduledDate]
  );

  return result.insertId;
};

const markPickupCompleted = async (requestId) => {

  await connection.query(
    `UPDATE pickup_activity
     SET collected_at = NOW()
     WHERE request_id = ?`,
    [requestId]
  );
};

const createDisposition = async (
  requestId,
  collectorId,
  dispositionType,
  remarks
) => {

  const [result] = await connection.query(
    `INSERT INTO ewaste_disposition
     (request_id, collector_id, disposition_type, remarks)
     VALUES (?, ?, ?, ?)`,
    [requestId, collectorId, dispositionType, remarks]
  );

  return result.insertId;
};

export {
    createRequest,
    addItemToRequest,
    getUserRequests,
    getRequestById,
    findCollectorByCity,
    deleteRequest,
    getUserRequestStats,
    getCollectorRequests,
    updateRequestStatus,
    createPickupActivity,
    markPickupCompleted,
    createDisposition
}