<?php
// backend/auth/login.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . "/../db.php";
$env = require __DIR__ . "/../config/env.php";
require __DIR__ . "/../vendor/autoload.php";


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

// === Generar JWT (access token) ===
$payload = [
  "id" => $user["id"],
  "role" => $user["role"],
  "exp" => time() + 3600 // 1 hora
];
$access_token = JWT::encode($payload, $key, 'HS256');

// === Generar Refresh Token (7 días) ===
$refresh_token = bin2hex(random_bytes(32));
$expires_at = date('Y-m-d H:i:s', strtotime('+7 days'));

$stmt = $conn->prepare("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $user['id'], $refresh_token, $expires_at);
$stmt->execute();

// === Respuesta ===
echo json_encode([
  "message" => "Login correcto",
  "access_token" => $access_token,
  "refresh_token" => $refresh_token,
  "user" => [
    "id" => $user["id"],
    "name" => $user["name"],
    "email" => $user["email"],
    "role" => $user["role"],
  ],
]);
?>
