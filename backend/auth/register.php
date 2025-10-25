<?php
// backend/auth/register.php

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

$key = $env["JWT_SECRET"];

// === Obtener datos ===
$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

// === Validaciones ===
if (!$name || !$email || !$password) {
  http_response_code(400);
  echo json_encode(["error" => "Todos los campos son obligatorios"]);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(["error" => "El email no tiene un formato válido"]);
  exit;
}

$pattern = "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/";
if (!preg_match($pattern, $password)) {
  http_response_code(400);
  echo json_encode(["error" => "La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos."]);
  exit;
}

// === Verificar email existente ===
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
  http_response_code(400);
  echo json_encode(["error" => "El email ya está registrado"]);
  exit;
}

// === Insertar usuario ===
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')");
$stmt->bind_param("sss", $name, $email, $hashedPassword);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Error al registrar el usuario"]);
  exit;
}

$userId = $conn->insert_id;

// === Generar JWT ===
$payload = [
  "id" => $userId,
  "role" => "customer",
  "exp" => time() + 3600
];
$access_token = JWT::encode($payload, $key, "HS256");

// === Generar Refresh Token ===
$refresh_token = bin2hex(random_bytes(32));
$expires_at = date('Y-m-d H:i:s', strtotime('+7 days'));

$stmt = $conn->prepare("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $userId, $refresh_token, $expires_at);
$stmt->execute();

// === Respuesta ===
echo json_encode([
  "message" => "Registro exitoso",
  "access_token" => $access_token,
  "refresh_token" => $refresh_token,
  "user" => [
    "id" => $userId,
    "name" => $name,
    "email" => $email,
    "role" => "customer",
  ],
]);
?>
