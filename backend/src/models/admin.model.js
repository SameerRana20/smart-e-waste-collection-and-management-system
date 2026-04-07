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

const getAdminStats = async () => {

  const [[users]] = await connection.query(
    `SELECT COUNT(*) AS total_users FROM users`
  );

  const [[collectors]] = await connection.query(
    `SELECT COUNT(*) AS total_collectors FROM collectors`
  );

  const [[requests]] = await connection.query(
    `SELECT 
      COUNT(*) AS total_requests,
      SUM(status = 'pending') AS pending,
      SUM(status = 'assigned') AS assigned,
      SUM(status = 'completed') AS completed
     FROM ewaste_requests`
  );

  const [[disposition]] = await connection.query(
    `SELECT 
      SUM(disposition_type = 'recycled') AS recycled,
      SUM(disposition_type = 'reused') AS reused,
      SUM(disposition_type = 'disposed') AS disposed
     FROM ewaste_disposition`
  );

  const [[items]] = await connection.query(
    `SELECT SUM(quantity) AS total_items FROM ewaste_items`
  );

  return {
    users: users.total_users,
    collectors: collectors.total_collectors,
    requests,
    disposition,
    total_items: items.total_items || 0
  };
};

export
{
    createAdmin,
    findAdminByUsername,
    findAdminById,
    updateAdminRefreshToken,
    removeAdminRefreshToken,
    updatePassword, 
    updateAdminProfile,
    updateAdminAvatar,
    getAdminStats

}
