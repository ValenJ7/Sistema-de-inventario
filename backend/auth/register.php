<?php
// backend/auth/register.php

// === CORS HEADERS ===
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
require '../vendor/autoload.php';

use Firebase\JWT\JWT;

$key = $env["JWT_SECRET"];

// === Obtener datos del body ===
$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

// === Validaciones básicas ===
if (!$name || !$email || !$password) {
  http_response_code(400);
  echo json_encode(["error" => "Todos los campos son obligatorios"]);
  exit;
}

// === Validar formato de email ===
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(["error" => "El email no tiene un formato válido"]);
  exit;
}

// === Validar seguridad de contraseña ===
$pattern = "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/";
if (!preg_match($pattern, $password)) {
  http_response_code(400);
  echo json_encode([
    "error" =>
      "La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos.",
  ]);
  exit;
}

// === Comprobar si el email ya existe ===
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
  http_response_code(400);
  echo json_encode(["error" => "El email ya está registrado"]);
  exit;
}

// === Encriptar la contraseña ===
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// === Insertar usuario nuevo ===
$stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')");
$stmt->bind_param("sss", $name, $email, $hashedPassword);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(["error" => "Error al registrar el usuario"]);
  exit;
}

$userId = $conn->insert_id;

// === Generar token JWT ===
$payload = [
  "id" => $userId,
  "role" => "customer",
  "exp" => time() + 3600, // expira en 1 hora
];
$jwt = JWT::encode($payload, $key, "HS256");

// === Respuesta exitosa ===
echo json_encode([
  "message" => "Registro exitoso",
  "token" => $jwt,
  "user" => [
    "id" => $userId,
    "name" => $name,
    "email" => $email,
    "role" => "customer",
  ],
]);
?>
