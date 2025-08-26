<?php
// ----------------------------------------------
// 🧾 get-categories.php
// 🎯 Lista categorías
// ----------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require '../db.php';

$sql = "SELECT id, name, description, created_at FROM categories ORDER BY created_at DESC";
$result = $conn->query($sql);

$rows = [];
if ($result && $result->num_rows) {
  while ($r = $result->fetch_assoc()) {
    $rows[] = $r;
  }
}

echo json_encode($rows, JSON_UNESCAPED_UNICODE);
