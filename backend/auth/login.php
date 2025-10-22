<?php
// backend/auth/login.php

// 🔧 CORS headers — necesarios para permitir peticiones desde React (localhost:5173)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Si el método es OPTIONS (preflight request), respondemos vacío y salimos
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once "../db.php";  // conexión a la base de datos

$data = json_decode(file_get_contents("php://input"), true);
$email = $data["email"] ?? "";
$password = $data["password"] ?? "";

if (!$email || !$password) {
  http_response_code(400);
  echo json_encode(["error" => "Email y contraseña requeridos"]);
  exit;
}

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

$token = bin2hex(random_bytes(32));

echo json_encode([
  "message" => "Login correcto",
  "token" => $token,
  "user" => [
    "id" => $user["id"],
    "name" => $user["name"],
    "email" => $user["email"],
    "role" => $user["role"],
  ],
]);
?>
