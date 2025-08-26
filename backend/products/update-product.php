<?php
// ----------------------------------------------
// 🧾 update-product.php
// 🎯 Actualizar producto (POST JSON)
// ----------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include '../db.php';
$data = json_decode(file_get_contents("php://input"), true);

$id          = intval($data['id'] ?? 0);
$name        = $conn->real_escape_string($data['name'] ?? '');
$size        = $conn->real_escape_string($data['size'] ?? '');
$price       = isset($data['price']) ? floatval($data['price']) : null;
$stock       = isset($data['stock']) ? intval($data['stock']) : null;
$category_id = isset($data['category_id']) && $data['category_id'] !== '' ? intval($data['category_id']) : 'NULL';

if ($id <= 0 || $name === '' || $price === null || $stock === null) {
  http_response_code(400);
  echo json_encode(["success"=>false, "error"=>"Datos inválidos"]);
  exit;
}

$sql = "
  UPDATE products
  SET name = '$name',
      size = '$size',
      price = $price,
      stock = $stock,
      category_id = $category_id
  WHERE id = $id
";

if ($conn->query($sql)) {
  echo json_encode(["success"=>true]);
} else {
  http_response_code(500);
  echo json_encode(["success"=>false, "error"=>"Error al actualizar"]);
}
