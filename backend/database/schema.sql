
CREATE TABLE IF NOT EXISTS users
(
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address TEXT,
    city VARCHAR(50),
    avatar_url VARCHAR(255),
    reward_points INT DEFAULT 0,
    refresh_token VARCHAR(500),
    created_at TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP  
        ON UPDATE CURRENT_TIMESTAMP
) AUTO_INCREMENT = 1000;


CREATE TABLE IF NOT EXISTS collectors
(
    collector_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    city VARCHAR(50) NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL ,
    organization_name VARCHAR(100) NOT NULL,
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    refresh_token VARCHAR(500),
    created_at TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP  
        ON UPDATE CURRENT_TIMESTAMP
) AUTO_INCREMENT = 100;

CREATE TABLE IF NOT EXISTS admins
(
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    refresh_token VARCHAR(500),
    created_at TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP 
        DEFAULT CURRENT_TIMESTAMP  
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ewaste_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    assigned_collector_id INT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'assigned', 'completed', 'cancelled') DEFAULT 'pending',

    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,

    FOREIGN KEY (assigned_collector_id) REFERENCES collectors(collector_id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ewaste_items 
(
    item_id  INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    item_type VARCHAR(50),
    quantity INT DEFAULT 1,
    condition_desc VARCHAR(255),

    FOREIGN KEY (request_id) REFERENCES ewaste_requests(request_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ewaste_images
(
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    image_url VARCHAR(255),

    FOREIGN KEY (item_id) REFERENCES ewaste_items(item_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pickup_activity
(
    pickup_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    collector_id INT NOT NULL,
    scheduled_date DATE, 
    collected_at TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES ewaste_requests(request_id)
    ON DELETE CASCADE,

    FOREIGN KEY (collector_id) REFERENCES collectors(collector_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ewaste_disposition (
    disposition_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    collector_id INT NOT NULL,
    disposition_type ENUM('recycled', 'reused', 'disposed'),
    remarks VARCHAR(255),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (request_id) REFERENCES ewaste_requests(request_id)
    ON DELETE CASCADE,

    FOREIGN KEY (collector_id) REFERENCES collectors(collector_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS incentive_redemptions (
    redemption_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points_redeemed INT,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
);


