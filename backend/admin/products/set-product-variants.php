<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) json_error('JSON inválido', 400);

$productId = (int)($body['product_id'] ?? 0);
$variants  = $body['variants'] ?? null;
if ($productId <= 0) json_error('product_id requerido', 400);
if (!is_array($variants) || !count($variants)) json_error('variants vacío', 400);

// normalizar y deduplicar por label (case-insensitive)
$clean = [];
foreach ($variants as $i => $v) {
  $label = trim((string)($v['label'] ?? ''));
  if ($label === '') continue;
  $stock = max(0, (int)($v['stock'] ?? 0));
  $order = isset($v['sort_order']) ? (int)$v['sort_order'] : $i;
  $sku   = isset($v['sku']) ? (string)$v['sku'] : null;
  $clean[strtolower($label)] = ['label'=>$label, 'stock'=>$stock, 'sort_order'=>$order, 'sku'=>$sku];
}
if (!count($clean)) json_error('No hay variantes válidas', 400);

$conn->begin_transaction();

// UPSERT por (product_id,label)
$ins = $conn->prepare("
  INSERT INTO product_variants (product_id, label, sku, stock, sort_order)
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE sku=VALUES(sku), stock=VALUES(stock), sort_order=VALUES(sort_order)
");
if (!$ins) { $conn->rollback(); json_error('Error preparando insert: '.$conn->error, 500); }

foreach ($clean as $k => $v) {
  $ins->bind_param('issii', $productId, $v['label'], $v['sku'], $v['stock'], $v['sort_order']);
  if (!$ins->execute()) { $conn->rollback(); json_error('Error guardando variante: '.$ins->error, 500); }
}
$ins->close();

// eliminar las que NO vinieron
$labels = array_map(fn($x) => $x['label'], array_values($clean));
$in = implode(',', array_fill(0, count($labels), '?'));
$types = str_repeat('s', count($labels));
$sqlDel = "DELETE FROM product_variants WHERE product_id = ? AND label NOT IN ($in)";
$del = $conn->prepare($sqlDel);
if (!$del) { $conn->rollback(); json_error('Error preparando delete: '.$conn->error, 500); }

$bindParams = array_merge([$productId], $labels);
$bindTypes  = 'i' . $types;
$del->bind_param($bindTypes, ...$bindParams);
if (!$del->execute()) { $conn->rollback(); json_error('Error depurando variantes: '.$del->error, 500); }
$del->close();

$conn->commit();
json_ok(['product_id'=>$productId]);
