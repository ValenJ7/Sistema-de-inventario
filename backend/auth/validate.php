<?php
// backend/auth/validate.php

$env = require __DIR__ . "/../config/env.php";
require __DIR__ . "/../vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$key = $env['JWT_SECRET'];
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader) {
  http_response_code(401);
  echo json_encode(["error" => "Token requerido"]);
  exit;
}

$token = str_replace('Bearer ', '', $authHeader);

try {
  $decoded = JWT::decode($token, new Key($key, 'HS256'));
  echo json_encode([
    "valid" => true,
    "user" => [
      "id" => $decoded->id,
      "role" => $decoded->role,
      "exp" => $decoded->exp
    ]
  ]);
} catch (ExpiredException $e) {
  http_response_code(401);
  echo json_encode(["valid" => false, "error" => "expired"]);
} catch (Exception $e) {
  http_response_code(401);
  echo json_encode(["valid" => false, "error" => "Token inválido"]);
}
?>
