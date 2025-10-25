<?php
// backend/auth/refresh.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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
$data = json_decode(file_get_contents("php://input"), true);
$refresh_token = $data["refresh_token"] ?? "";

if (!$refresh_token) {
  http_response_code(400);
  echo json_encode(["error" => "Token de actualización requerido"]);
  exit;
}

// Buscar el token en la BD
$stmt = $conn->prepare("SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()");
$stmt->bind_param("s", $refresh_token);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row) {
  http_response_code(401);
  echo json_encode(["error" => "Token inválido o expirado"]);
  exit;
}

// Obtener usuario
$user_id = $row["user_id"];
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
  http_response_code(404);
  echo json_encode(["error" => "Usuario no encontrado"]);
  exit;
}

// Generar nuevo JWT
$newPayload = [
  "id" => $user["id"],
  "role" => $user["role"],
  "exp" => time() + 3600
];
$newJWT = JWT::encode($newPayload, $key, "HS256");

// Respuesta
echo json_encode([
  "access_token" => $newJWT,
  "message" => "Token renovado correctamente"
]);
?>
