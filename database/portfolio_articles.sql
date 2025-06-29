-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS portfolio_articles;
USE portfolio_articles;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password will be hashed in PHP)
INSERT INTO users (username, password) VALUES ('rizqi', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample articles
INSERT INTO articles (title, content, category, author, featured) VALUES
('Getting Started with Machine Learning', 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. In this article, we''ll explore the fundamentals of ML and how to get started with your first project.', 'Machine Learning', 'Rizqi Amanullah', TRUE),
('Computer Vision Applications in Real World', 'Computer Vision has revolutionized many industries by enabling machines to interpret and understand visual information. From autonomous vehicles to medical imaging, CV applications are everywhere around us.', 'Computer Vision', 'Rizqi Amanullah', FALSE),
('Data Science Best Practices', 'Data Science is more than just analyzing data. It involves understanding business problems, cleaning data, building models, and communicating insights effectively. Here are some best practices every data scientist should follow.', 'Data Science', 'Rizqi Amanullah', TRUE);
