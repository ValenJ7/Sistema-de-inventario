<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

$saleId = isset($_GET['sale_id']) ? (int)$_GET['sale_id'] : 0;
if ($saleId <= 0) json_error("sale_id requerido", 400);

// 🔹 Buscar la venta
$stmt = $conn->prepare("SELECT id, created_at, total FROM sales WHERE id = ?");
$stmt->bind_param("i", $saleId);
$stmt->execute();
$res = $stmt->get_result();
$sale = $res ? $res->fetch_assoc() : null;
$stmt->close();

if (!$sale) {
  json_error("Venta no encontrada", 404);
}

// 🔹 Buscar ítems con producto e imagen
$stmt = $conn->prepare("
  SELECT si.id, si.product_id, p.name AS product_name, p.size,
         si.quantity, si.price, si.subtotal,
         pi.url AS image_url
  FROM sale_items si
  LEFT JOIN products p ON p.id = si.product_id
  LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 0
  WHERE si.sale_id = ?
");
$stmt->bind_param("i", $saleId);
$stmt->execute();
$res = $stmt->get_result();
$items = [];
while ($row = $res->fetch_assoc()) {
  // armar URL absoluta para la imagen
  $row['image_url'] = $row['image_url']
    ? "http://localhost/SistemaDeInventario/backend" . $row['image_url']
    : null;
  $items[] = $row;
}
$stmt->close();

// 🔹 Devolver la venta con items
$data = [
  'id' => $sale['id'],
  'created_at' => $sale['created_at'],
  'total' => $sale['total'],
  'items' => $items
];

json_ok($data);
