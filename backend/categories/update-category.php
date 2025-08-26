<?php
// ----------------------------------------------
// 🧾 update-category.php
// 🎯 Actualizar categoría (PUT JSON)
// ----------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require '../db.php';
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['name'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Faltan campos']);
  exit;
}

$id   = intval($data['id']);
$name = $conn->real_escape_string($data['name']);
$description = $conn->real_escape_string($data['description'] ?? '');

$sql = "UPDATE categories SET name='$name', description='$description' WHERE id=$id";
if ($conn->query($sql) === TRUE) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'No se pudo actualizar']);
}
