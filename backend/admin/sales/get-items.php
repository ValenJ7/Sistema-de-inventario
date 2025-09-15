<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

$saleId = isset($_GET['sale_id']) ? (int)$_GET['sale_id'] : 0;
if ($saleId <= 0) json_error("sale_id requerido", 400);

// Venta
$stmt = $conn->prepare("SELECT id, created_at, total FROM sales WHERE id = ?");
$stmt->bind_param("i", $saleId);
$stmt->execute();
$res = $stmt->get_result();
$sale = $res ? $res->fetch_assoc() : null;
$stmt->close();

if (!$sale) {
  json_error("Venta no encontrada", 404);
}

// Ítems + producto + imagen principal (talle desde sale_items)
$stmt = $conn->prepare("
  SELECT
    si.id,
    si.product_id,
    p.name AS product_name,
    si.size,
    si.quantity,
    si.price,
    si.subtotal,
    pi.url AS image_url
  FROM sale_items si
  LEFT JOIN products p ON p.id = si.product_id
  LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 0
  WHERE si.sale_id = ?
  ORDER BY si.id ASC
");
$stmt->bind_param("i", $saleId);
$stmt->execute();
$res = $stmt->get_result();

$items = [];
while ($row = $res->fetch_assoc()) {
  $row['image_url'] = $row['image_url']
    ? "http://localhost/SistemaDeInventario/backend" . $row['image_url']
    : null;
  $items[] = $row;
}
$stmt->close();

$data = [
  'id'         => (int)$sale['id'],
  'created_at' => $sale['created_at'],
  'total'      => (float)$sale['total'],
  'items'      => $items
];

json_ok($data);
