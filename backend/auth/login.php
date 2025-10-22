<?php
// backend/auth/login.php

// === CORS headers ===
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Preflight para OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once "../db.php";
require_once "../config/env.php";
require '../vendor/autoload.php'; // 👈 necesario para JWT

use Firebase\JWT\JWT;

// === Clave secreta ===
$key = $env['JWT_SECRET'];

// === Obtener datos del body ===
$data = json_decode(file_get_contents("php://input"), true);
$email = $data["email"] ?? "";
$password = $data["password"] ?? "";

// === Validación básica ===
if (!$email || !$password) {
  http_response_code(400);
  echo json_encode(["error" => "Email y contraseña requeridos"]);
  exit;
}

// === Buscar usuario en BD ===
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user["password"])) {
  http_response_code(401);
  echo json_encode(["error" => "Credenciales incorrectas"]);
  exit;
}

// === Generar token JWT ===
$payload = [
  "id" => $user["id"],
  "role" => $user["role"],
  "exp" => time() + 3600, // expira en 1 hora
];

$jwt = JWT::encode($payload, $key, 'HS256');

// === Respuesta ===
echo json_encode([
  "message" => "Login correcto",
  "token" => $jwt,
  "user" => [
    "id" => $user["id"],
    "name" => $user["name"],
    "email" => $user["email"],
    "role" => $user["role"],
  ],
]);
?>
