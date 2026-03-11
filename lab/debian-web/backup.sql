-- PacketFeeder Lab Database Dump
-- Date: 2024-10-15 03:00:01
-- Server: localhost
-- Database: packetfeeder_lab

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin');
INSERT INTO users VALUES (2, 'operator', 'operator1', 'operator');
INSERT INTO users VALUES (3, 'john', 'password', 'user');
