<?php
// ----------------------------------------------
// 🧾 create-category.php
// 🎯 Crear categoría (POST JSON)
// ----------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require '../db.php';
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || $data['name'] === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Falta el nombre']);
  exit;
}

$name = $conn->real_escape_string($data['name']);
$description = $conn->real_escape_string($data['description'] ?? '');

$sql = "INSERT INTO categories (name, description) VALUES ('$name', '$description')";
if ($conn->query($sql) === TRUE) {
  echo json_encode(['success' => true, 'id' => $conn->insert_id]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'No se pudo crear']);
}
