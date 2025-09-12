<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

$saleId = isset($_GET['sale_id']) ? (int)$_GET['sale_id'] : 0;
if ($saleId <= 0) json_error("sale_id requerido", 400);

$stmt = $conn->prepare("
  SELECT si.id, si.product_id, p.name AS product_name, si.quantity, si.price, si.subtotal
  FROM sale_items si
  JOIN products p ON p.id = si.product_id
  WHERE si.sale_id = ?
");
$stmt->bind_param("i", $saleId);
$stmt->execute();
$res = $stmt->get_result();
$rows = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
$stmt->close();

json_ok($rows);
