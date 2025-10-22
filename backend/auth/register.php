<?php
// backend/auth/register.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once "../db.php";
require_once "../config/env.php";
require '../vendor/autoload.php';

use Firebase\JWT\JWT;

// === Clave JWT ===
$key = $env['JWT_SECRET'];

// === Leer body JSON ===
$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

// === Validar campos ===
if (!$name || !$email || !$password) {
  http_response_code(400);
  echo json_encode(["error" => "Faltan campos obligatorios"]);
  exit;
}

// === Verificar si el email ya existe ===
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
  http_response_code(409);
  echo json_encode(["error" => "El correo ya está registrado"]);
  exit;
}
$stmt->close();

// === Hashear contraseña ===
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// === Crear usuario con rol 'customer' ===
$role = 'customer';
$stmt = $conn->prepare("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("ssss", $name, $email, $hashedPassword, $role);

if ($stmt->execute()) {
  $user_id = $stmt->insert_id;

  // === Generar token igual que login ===
  $payload = [
    "id" => $user_id,
    "role" => $role,
    "exp" => time() + 3600
  ];
  $jwt = JWT::encode($payload, $key, 'HS256');

  echo json_encode([
    "message" => "Registro exitoso",
    "token" => $jwt,
    "user" => [
      "id" => $user_id,
      "name" => $name,
      "email" => $email,
      "role" => $role,
    ],
  ]);
} else {
  http_response_code(500);
  echo json_encode(["error" => "Error al registrar el usuario"]);
}

$stmt->close();
$conn->close();
?>
