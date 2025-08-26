<?php
// ----------------------------------------------
// 🧾 get-products.php
// 🎯 Lista productos (con nombre de categoría)
// ----------------------------------------------
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include '../db.php';

$sql = "
  SELECT
    p.id, p.name, p.size, p.price, p.stock, p.category_id,
    c.name AS category_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  ORDER BY p.created_at DESC
";
$res = $conn->query($sql);

$rows = [];
if ($res && $res->num_rows > 0) {
  while ($r = $res->fetch_assoc()) $rows[] = $r;
}

echo json_encode($rows);
