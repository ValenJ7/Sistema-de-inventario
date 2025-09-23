<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

$productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : 0;
if ($productId <= 0) json_error('product_id requerido', 400);

$sql = "SELECT id, label, sku, stock, sort_order
        FROM product_variants
        WHERE product_id = ?
        ORDER BY sort_order ASC, id ASC";
$stmt = $conn->prepare($sql);
if (!$stmt) json_error('Error preparando consulta: '.$conn->error, 500);
$stmt->bind_param('i', $productId);
$stmt->execute();
$res = $stmt->get_result();
$rows = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
$stmt->close();

json_ok($rows);
