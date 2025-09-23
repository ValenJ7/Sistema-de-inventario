<?php
// backend/admin/products/update-variant-stock.php
declare(strict_types=1);
header('Content-Type: application/json');

require_once __DIR__ . '/../../db.php'; // <-- ajustá a tu include real

if (!function_exists('json_ok')) {
  function json_ok($data=null){ echo json_encode(['success'=>true,'data'=>$data]); exit; }
  function json_error($msg,$code=400){ http_response_code($code); echo json_encode(['success'=>false,'error'=>$msg]); exit; }
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) json_error('JSON inválido');

$variantId = (int)($input['variant_id'] ?? 0);
$delta     = (int)($input['delta'] ?? 0);

if ($variantId <= 0) json_error('variant_id requerido');
if ($delta === 0)   json_error('delta debe ser distinto de 0');

try {
  $pdo->beginTransaction();

  // Bloqueo fila
  $stmt = $pdo->prepare("SELECT stock FROM product_variants WHERE id = :id FOR UPDATE");
  $stmt->execute([':id'=>$variantId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) { $pdo->rollBack(); json_error('Variante inexistente', 404); }

  $new = (int)$row['stock'] + $delta;
  if ($new < 0) { $pdo->rollBack(); json_error('Stock resultante negativo'); }

  $upd = $pdo->prepare("UPDATE product_variants SET stock = :s WHERE id = :id");
  $upd->execute([':s'=>$new, ':id'=>$variantId]);

  $pdo->commit();
  json_ok(['variant_id'=>$variantId, 'new_stock'=>$new]);

} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  json_error('Error actualizando stock: '.$e->getMessage(), 500);
}
