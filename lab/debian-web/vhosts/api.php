<?php
header('Content-Type: application/json');
header('X-API-Version: 1.0.3');

$response = [
    'service' => 'PacketFeeder API',
    'version' => '1.0.3',
    'status' => 'running',
    'endpoints' => [
        ['method' => 'GET',    'path' => '/api/v1/users',       'description' => 'List all users'],
        ['method' => 'GET',    'path' => '/api/v1/users/{id}',  'description' => 'Get user by ID'],
        ['method' => 'POST',   'path' => '/api/v1/users',       'description' => 'Create new user'],
        ['method' => 'GET',    'path' => '/api/v1/config',      'description' => 'Get system configuration'],
        ['method' => 'PUT',    'path' => '/api/v1/config',      'description' => 'Update configuration'],
        ['method' => 'GET',    'path' => '/api/v1/health',      'description' => 'Health check'],
        ['method' => 'GET',    'path' => '/api/v1/logs',        'description' => 'Retrieve application logs'],
        ['method' => 'POST',   'path' => '/api/v1/auth/login',  'description' => 'Authenticate user'],
        ['method' => 'DELETE', 'path' => '/api/v1/auth/logout', 'description' => 'Invalidate session'],
    ],
    'documentation' => '/api/v1/docs',
    'authentication' => 'Bearer token required for all endpoints except /health',
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
