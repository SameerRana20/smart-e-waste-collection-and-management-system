import { connection } from "../db/db.js"

const createUser = async(userData) =>{

    const {full_name, email, password_hash, phone, address, city} = userData

    const [result] =   await connection.query(
                            `INSERT INTO  users (full_name, email,  password_hash, phone, address, city)
                            VALUES (? , ? , ? , ? ,? ,? )`, [full_name, email, password_hash , phone, address, city]
                        );
    return result;
}

const findUserByEmail = async (email)=>{

    const [rows] = await connection.query(
        `SELECT * FROM users WHERE email = ?`, [email]
    );
    return rows[0]
}

const findUserById = async(userId)=>{
    const [rows] = await connection.query(
        `SELECT * FROM users WHERE user_id = ?`, [userId]
    )
    return rows[0]
}

const updateRefreshToken = async (user_id, refreshToken)=>{
    const [result] = await connection.query(
        `UPDATE users  SET refresh_token= ? 
         WHERE user_id = ?`, [refreshToken, user_id]
    )
    return result
}

const removeRefreshToken = async (userId)=> {
    const [result] = await connection.query(
        `UPDATE users SET refresh_token = NULL WHERE user_id= ?`,[userId]
    )
    return result
}

const updatePassword = async(userId, newPassword)=>{
    const [result]= await connection.query(
        `UPDATE users SET password_hash = ? WHERE user_id= ? `,[newPassword, userId]
    )
    return result
}

const updateUserProfile = async (userId , data)=>{
    const { full_name, city, phone, address }= data

    const [result]= await connection.query(
        `UPDATE users SET full_name= ? , city= ? , phone =? , address= ? WHERE user_id = ?`
        , [full_name, city, phone, address, userId] 
    )
    return result
}

const updateUserAvatar= async(userId, url)=>{
    const [result] = await connection.query(
            `UPDATE users SET avatar_url = ? WHERE user_id = ? `, [url, userId]
    )

    return result
}

export
{
    createUser,
    findUserByEmail,
    findUserById,
    updateRefreshToken,
    removeRefreshToken,
    updatePassword, 
    updateUserProfile,
    updateUserAvatar

}
