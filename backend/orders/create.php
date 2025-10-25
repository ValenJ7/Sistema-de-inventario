<?php
// backend/orders/create.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
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
use Firebase\JWT\Key;

// === VALIDAR TOKEN JWT ===
$headers = getallheaders();
$authHeader = $headers["Authorization"] ?? "";

if (!$authHeader) {
  http_response_code(401);
  echo json_encode(["error" => "Token requerido"]);
  exit;
}

try {
  $token = str_replace("Bearer ", "", $authHeader);
  $decoded = JWT::decode($token, new Key($env["JWT_SECRET"], "HS256"));
  $user_id = $decoded->id;
} catch (Exception $e) {
  http_response_code(401);
  echo json_encode(["error" => "Token inválido o expirado"]);
  exit;
}

// === LEER BODY ===
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
  http_response_code(400);
  echo json_encode(["error" => "Cuerpo de solicitud inválido"]);
  exit;
}

$items = $data["items"] ?? [];
$address = trim($data["address"] ?? "");
$city = trim($data["city"] ?? "");
$province = trim($data["province"] ?? "");
$postal_code = trim($data["postal_code"] ?? "");

if (empty($items) || !$address || !$city || !$postal_code) {
  http_response_code(400);
  echo json_encode(["error" => "Faltan datos del pedido"]);
  exit;
}

// === CALCULAR TOTAL ===
$total = 0;
foreach ($items as $item) {
  if (!isset($item["price"], $item["quantity"])) continue;
  $total += $item["price"] * $item["quantity"];
}

// === INSERTAR PEDIDO ===
$stmt = $conn->prepare("INSERT INTO orders (user_id, total, address, city, province, postal_code) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("idssss", $user_id, $total, $address, $city, $province, $postal_code);
$stmt->execute();
$order_id = $stmt->insert_id;

// === INSERTAR ITEMS ===
$stmtItem = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
foreach ($items as $item) {
  $pid = $item["id"];
  $qty = $item["qty"];
  $price = $item["price"];
  $stmtItem->bind_param("iiid", $order_id, $pid, $qty, $price);
  $stmtItem->execute();
}

// === RESPUESTA EXITOSA ===
echo json_encode([
  "message" => "Pedido creado correctamente",
  "order_id" => $order_id,
  "total" => $total,
  "payment_link" => "https://example.com/pagar/" . $order_id
]);
?>
