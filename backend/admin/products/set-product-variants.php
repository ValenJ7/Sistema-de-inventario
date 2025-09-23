<?php
// backend/admin/products/set-product-variants.php
declare(strict_types=1);
header('Content-Type: application/json');

require_once __DIR__ . '/../../db.php'; // <-- ajustá a tu include real

if (!function_exists('json_ok')) {
  function json_ok($data=null){ echo json_encode(['success'=>true,'data'=>$data]); exit; }
  function json_error($msg,$code=400){ http_response_code($code); echo json_encode(['success'=>false,'error'=>$msg]); exit; }
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) json_error('JSON inválido');

$productId = (int)($input['product_id'] ?? 0);
$variants  = $input['variants'] ?? null;

if ($productId <= 0) json_error('product_id requerido');
if (!is_array($variants) || !count($variants)) json_error('variants vacío');

try {
  $pdo->beginTransaction();

  // Normalizo labels y preparo set recibido
  $clean = [];
  foreach ($variants as $i => $v) {
    $label = trim((string)($v['label'] ?? ''));
    if ($label === '') continue;
    $stock = max(0, (int)($v['stock'] ?? 0));
    $sku   = isset($v['sku']) ? (string)$v['sku'] : null;
    $order = isset($v['sort_order']) ? (int)$v['sort_order'] : $i;
    $clean[strtolower($label)] = [
      'label'=>$label, 'stock'=>$stock, 'sku'=>$sku, 'sort_order'=>$order
    ];
  }
  if (!count($clean)) json_error('No hay variantes válidas');

  // Traigo existentes
  $stmt = $pdo->prepare("SELECT id, label FROM product_variants WHERE product_id = :pid");
  $stmt->execute([':pid'=>$productId]);
  $existing = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // [id => label]

  // Map label->id para existentes
  $byLabel = [];
  foreach ($existing as $id => $label) $byLabel[strtolower($label)] = (int)$id;

  // Upsert recibidos
  $upsert = $pdo->prepare("
    INSERT INTO product_variants (product_id, label, sku, stock, sort_order)
    VALUES (:pid, :label, :sku, :stock, :ord)
    ON DUPLICATE KEY UPDATE sku = VALUES(sku), stock = VALUES(stock), sort_order = VALUES(sort_order)
  ");

  foreach ($clean as $key => $v) {
    $upsert->execute([
      ':pid'   => $productId,
      ':label' => $v['label'],
      ':sku'   => $v['sku'],
      ':stock' => $v['stock'],
      ':ord'   => $v['sort_order'],
    ]);
  }

  // Eliminar las que NO vinieron
  if (count($existing)) {
    $labelsCame = array_map(fn($v) => $v['label'], array_values($clean));
    $inLabels   = implode(',', array_fill(0, count($labelsCame), '?'));

    $del = $pdo->prepare("DELETE FROM product_variants WHERE product_id=? AND label NOT IN ($inLabels)");
    $params = array_merge([$productId], $labelsCame);
    $del->execute($params);
  } else {
    // Si no había, aseguramos que no quede nada “raro” (no debería pasar por UNIQ)
  }

  $pdo->commit();
  json_ok(['product_id'=>$productId]);

} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  json_error('Error guardando variantes: '.$e->getMessage(), 500);
}
