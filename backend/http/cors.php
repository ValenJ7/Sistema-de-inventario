<?php
$env = require __DIR__ . '/../config/env.php';

header('Access-Control-Allow-Origin: '  . $env['CORS_ALLOW_ORIGIN']);
header('Access-Control-Allow-Headers: ' . $env['CORS_ALLOW_HEADERS']);
header('Access-Control-Allow-Methods: ' . $env['CORS_ALLOW_METHODS']);
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}
