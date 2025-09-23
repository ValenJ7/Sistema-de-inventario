<?php
// backend/admin/products/get-product-variants.php
declare(strict_types=1);
header('Content-Type: application/json');

require_once __DIR__ . '/../../db.php'; // <-- ajustá a tu include real

if (!function_exists('json_ok')) {
  function json_ok($data) { echo json_encode(['success'=>true,'data'=>$data]); exit; }
  function json_error($msg,$code=400){ http_response_code($code); echo json_encode(['success'=>false,'error'=>$msg]); exit; }
}

$productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : 0;
if ($productId <= 0) json_error('product_id requerido');

$sql = "SELECT id, label, sku, stock, sort_order
        FROM product_variants
        WHERE product_id = :pid
        ORDER BY sort_order ASC, id ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute([':pid'=>$productId]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

json_ok($rows);
