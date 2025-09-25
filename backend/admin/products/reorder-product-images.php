<?php
// admin/products/reorder-product-images.php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

/**
 * Espera (en form-data):
 *  - product_id: int
 *  - order[]: [imageId1, imageId2, ...] (en el NUEVO orden)
 *
 * Ejemplo desde frontend:
 *   const fd = new FormData();
 *   fd.append('product_id', productId);
 *   ids.forEach(id => fd.append('order[]', id));
 *   await api.post('admin/products/reorder-product-images.php', fd);
 */

$product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
$order      = isset($_POST['order']) ? $_POST['order'] : [];  // array

if ($product_id <= 0) json_error('product_id requerido', 422);
if (!is_array($order) || count($order) === 0) json_error('order[] requerido', 422);

// normalizar ids
$ids = array_values(array_unique(array_map('intval', $order)));
if (count($ids) === 0) json_error('order[] vacío', 422);

// validar que todas las imágenes pertenezcan al producto
$in = implode(',', array_fill(0, count($ids), '?'));
$sql = "SELECT id FROM product_images WHERE product_id = ? AND id IN ($in)";
$stmt = $mysqli->prepare($sql);
if (!$stmt) json_error('Error SQL (prepare check): '.$mysqli->error, 500);

$types = str_repeat('i', count($ids) + 1);
$params = array_merge([$product_id], $ids);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$res = $stmt->get_result();
$valid = [];
while ($row = $res->fetch_assoc()) $valid[] = intval($row['id']);
$stmt->close();

if (count($valid) !== count($ids)) json_error('IDs inválidos para este producto', 422);

$mysqli->begin_transaction();
try {
  // actualizar sort_order = posición+1
  $upd = $mysqli->prepare("UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?");
  if (!$upd) throw new Exception('Error SQL (prepare update): '.$mysqli->error);

  foreach ($ids as $i => $imgId) {
    $orderN = $i + 1;
    $upd->bind_param('iii', $orderN, $imgId, $product_id);
    $upd->execute();
  }
  $upd->close();

  // Opcional: asegurar 1 sola principal (si tenés columna is_main)
  // $mysqli->query("UPDATE product_images SET is_main = 0 WHERE product_id = $product_id");
  // $firstId = $ids[0];
  // $stm2 = $mysqli->prepare("UPDATE product_images SET is_main = 1 WHERE id =  AND product_id = ?");
  // $stm2->bind_param('ii', $firstId, $product_id);
  // $stm2->execute();
  // $stm2->close();

$mysqli->commit();
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
exit;
} catch (Throwable $e) {
  $mysqli->rollback();
  json_error('Error al reordenar: '.$e->getMessage(), 500);
}
