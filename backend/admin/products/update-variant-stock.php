<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) json_error('JSON inválido', 400);

$variantId = (int)($body['variant_id'] ?? 0);
$delta     = (int)($body['delta'] ?? 0);
if ($variantId <= 0) json_error('variant_id requerido', 400);
if ($delta === 0)   json_error('delta debe ser != 0', 400);

$conn->begin_transaction();

// lock row
$sel = $conn->prepare("SELECT stock FROM product_variants WHERE id = ? FOR UPDATE");
$sel->bind_param('i', $variantId);
$sel->execute();
$stock = 0;
$sel->bind_result($stock);
if (!$sel->fetch()) { $sel->close(); $conn->rollback(); json_error('Variante inexistente', 404); }
$sel->close();

$new = $stock + $delta;
if ($new < 0) { $conn->rollback(); json_error('Stock resultante negativo', 422); }

$upd = $conn->prepare("UPDATE product_variants SET stock = ? WHERE id = ?");
$upd->bind_param('ii', $new, $variantId);
if (!$upd->execute()) { $upd->close(); $conn->rollback(); json_error('Error actualizando stock: '.$upd->error, 500); }
$upd->close();

$conn->commit();
json_ok(['variant_id'=>$variantId, 'new_stock'=>$new]);
