<?php
// ----------------------------------------------
// 🧾 create-product.php
// 🎯 Crear producto (POST JSON)
// ----------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include '../db.php';
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['name']) || !isset($data['price']) || !isset($data['stock'])) {
  http_response_code(400);
  echo json_encode(["success"=>false, "error"=>"Faltan campos obligatorios"]);
  exit;
}

$name        = $conn->real_escape_string($data['name']);
$size        = $conn->real_escape_string($data['size'] ?? '');
$price       = floatval($data['price']);
$stock       = intval($data['stock']);
$category_id = isset($data['category_id']) && $data['category_id'] !== '' ? intval($data['category_id']) : 'NULL';

$sql = "INSERT INTO products (name, category_id, size, price, stock)
        VALUES ('$name', $category_id, '$size', $price, $stock)";

if ($conn->query($sql)) {
  echo json_encode(["success"=>true, "id"=>$conn->insert_id, "message"=>"Producto agregado"]);
} else {
  http_response_code(500);
  echo json_encode(["success"=>false, "error"=>"Error al insertar producto"]);
}
