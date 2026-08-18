-- Run this once in phpMyAdmin / MySQL Workbench / mysql CLI if you want to
-- create the table yourself. (The backend also creates it automatically the
-- first time it starts with DB_TYPE=mysql, so this is optional.)

CREATE DATABASE IF NOT EXISTS portfolio;
USE portfolio;

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  ip VARCHAR(64),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
