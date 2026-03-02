import { connection } from "../db/db.js"

//maybe but not required for now|| will be deleted in future    
const createAdmin = async(AdminData) =>{

    const {full_name, email, password_hash, phone, address, city} = AdminData

    const [result] =   await connection.query(
                            `INSERT INTO  admins (full_name, email,  password_hash, phone, address, city)
                            VALUES (? , ? , ? , ? ,? ,? )`, [full_name, email, password_hash , phone, address, city]
                        );
    return result;
}

const findAdminByUsername = async (username)=>{

    const [rows] = await connection.query(
        `SELECT * FROM admins WHERE username = ?`, [username]
    );
    return rows[0]
}

const findAdminById = async(AdminId)=>{
    const [rows] = await connection.query(
        `SELECT * FROM admins WHERE admin_id = ?`, [AdminId]
    )
    return rows[0]
}

const updateAdminRefreshToken = async (Admin_id, refreshToken)=>{
    const [result] = await connection.query(
        `UPDATE admins  SET refresh_token= ? 
         WHERE admin_id = ?`, [refreshToken, Admin_id]
    )
    return result
}

const removeAdminRefreshToken = async (AdminId)=> {
    const [result] = await connection.query(
        `UPDATE admins SET refresh_token = NULL WHERE admin_id= ?`,[AdminId]
    )
    return result
}

const updatePassword = async(AdminId, newPassword)=>{
    const [result]= await connection.query(
        `UPDATE admins SET password_hash = ? WHERE admin_id= ? `,[newPassword, AdminId]
    )
    return result
}


//missmatched
const updateAdminProfile = async (AdminId , full_name)=>{
    

    const [result]= await connection.query(
        `UPDATE admins SET full_name= ? WHERE admin_id  = ?`
        , [full_name, AdminId] 
    )
    return result
}

const updateAdminAvatar= async(AdminId, url)=>{
    const [result] = await connection.query(
            `UPDATE admins SET avatar_url = ? WHERE admin_id  = ? `, [url, AdminId]
    )

    return result
}

export
{
    createAdmin,
    findAdminByUsername,
    findAdminById,
    updateAdminRefreshToken,
    removeAdminRefreshToken,
    updatePassword, 
    updateAdminProfile,
    updateAdminAvatar

}
