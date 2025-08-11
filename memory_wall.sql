CREATE DATABASE memory_wall;

USE memory_wall;

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    message TEXT,
    file_url VARCHAR(255),
    file_type ENUM('image','video'),
    likes INT DEFAULT 0, -- to store number of likes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store comments for each post
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    name VARCHAR(100),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
