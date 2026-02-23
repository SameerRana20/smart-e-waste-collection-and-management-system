import { connection } from "../db/db.js";



const createCollector = async (data) => {

    const { full_name, email, password_hash, phone, city, vehicle_number, organization_name } = data;

    const [result] = await connection.query(
        `INSERT INTO collectors 
        (full_name, email, password_hash, phone, city, vehicle_number, organization_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [full_name, email, password_hash, phone, city, vehicle_number, organization_name]
    );

    return result;
}

const findCollectorByEmail = async (email) => {

    const [rows] = await connection.query(
        `SELECT * FROM collectors WHERE email = ?`, [email]
    );

    return rows[0];
}

const findCollectorById = async (collectorId) => {

    const [rows] = await connection.query(
        `SELECT * FROM collectors WHERE collector_id = ?`,
        [collectorId]
    );

    return rows[0];
}

const updateCollectorRefreshToken = async (collectorId, refreshToken) => {

    const [result] = await connection.query(
        `UPDATE collectors SET refresh_token = ? WHERE collector_id = ?`,
        [refreshToken, collectorId]
    );

    return result;
};

const removeCollectorRefreshToken = async (collectorId) => {

    const [result] = await connection.query(
        `UPDATE collectors SET refresh_token = NULL WHERE collector_id = ?`,
        [collectorId]
    );

    return result;
};


export {
    createCollector,
    findCollectorByEmail,
    findCollectorById,
    updateCollectorRefreshToken,
    removeCollectorRefreshToken
};