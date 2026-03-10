-- PacketFeeder Lab Database Dump
-- Date: 2024-10-15 03:00:01
-- Server: localhost
-- Database: packetfeeder_lab

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user'
);

INSERT INTO users VALUES (1, 'admin', '$2y$10$kG8f3s9x2Hk4mJpL7nQ1wOvR5tY6uI8oP0aS3dF6gH9jK2lZ4xW', 'admin');
INSERT INTO users VALUES (2, 'operator', '$2y$10$mN7bV6cX5zA4wS3eD2fR1gT0hY9iU8oP7qK6jL5nM4bV3cX2zA1w', 'operator');
INSERT INTO users VALUES (3, 'john', '$2y$10$pQ9wE8rT7yU6iO5pA4sD3fG2hJ1kL0zX9cV8bN7mQ6wE5rT4yU3i', 'user');
