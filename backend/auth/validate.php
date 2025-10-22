<?php
// backend/auth/validate.php

require_once "../config/env.php";
require '../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

// Preflight para OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}


$env = require "../config/env.php";

$key = $env['JWT_SECRET'];

// Obtener el token del header Authorization
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader) {
  http_response_code(401);
  echo json_encode(["error" => "Token requerido"]);
  exit;
}

// Extraer el token (remueve el prefijo "Bearer ")
$token = str_replace('Bearer ', '', $authHeader);

try {
  // Decodificar y validar el JWT
  $decoded = JWT::decode($token, new Key($key, 'HS256'));

  // Si llega aquí, el token es válido ✅
  echo json_encode([
    "valid" => true,
    "user" => [
      "id" => $decoded->id,
      "role" => $decoded->role,
      "exp" => $decoded->exp
    ]
  ]);
} catch (Exception $e) {
  // Si falla la verificación o expiró ❌
  http_response_code(401);
  echo json_encode([
    "valid" => false,
    "error" => "Token inválido o expirado"
  ]);
}
?>
