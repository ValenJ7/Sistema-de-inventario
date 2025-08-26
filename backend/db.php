<?php
// backend/db.php
$env = require __DIR__ . '/config/env.php';

$conn = new mysqli(
  $env['DB_HOST'],
  $env['DB_USER'],
  $env['DB_PASS'],
  $env['DB_NAME'],  // <- ya NO va hardcodeado
  $env['DB_PORT']
);

if ($conn->connect_errno) {
  header('Content-Type: application/json; charset=utf-8');
  http_response_code(500);
  echo json_encode(['success'=>false, 'data'=>null, 'error'=>'DB connection failed: '.$conn->connect_error]);
  exit;
}

$conn->set_charset('utf8mb4');
