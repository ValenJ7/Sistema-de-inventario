<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

/**
 * Traemos productos + info de variantes mediante subconsultas,
 * así evitamos GROUP BY y respetamos mysqli como lo tenías.
 */
$sql = "
  SELECT
    p.id,
    p.name,
    p.slug,
    p.size,
    p.price,
    p.stock,
    p.category_id,
    c.name AS category_name,

    -- imagen principal (primera por sort_order, luego id)
    (
      SELECT pi.url
      FROM product_images pi
      WHERE pi.product_id = p.id
      ORDER BY pi.sort_order ASC, pi.id ASC
      LIMIT 1
    ) AS image_path,
    (
      SELECT pi.url
      FROM product_images pi
      WHERE pi.product_id = p.id
      ORDER BY pi.sort_order ASC, pi.id DESC
      LIMIT 1
    ) AS main_image,

    -- agregados de variantes
    (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) AS v_count,
    (SELECT COALESCE(SUM(v2.stock), 0) FROM product_variants v2 WHERE v2.product_id = p.id) AS v_stock_sum,
    (SELECT MIN(v3.stock) FROM product_variants v3 WHERE v3.product_id = p.id) AS v_stock_min,
    (SELECT GROUP_CONCAT(v4.label ORDER BY v4.sort_order ASC, v4.id ASC SEPARATOR '|||')
       FROM product_variants v4
       WHERE v4.product_id = p.id) AS v_labels
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  ORDER BY p.created_at DESC, p.id DESC
";

$stmt->execute();
$res = $stmt->get_result();

$rows = array(); // valor por defecto
if ($res) {
    $rows = $res->fetch_all(MYSQLI_ASSOC);
}

$stmt->close();


/**
 * Enriquecemos cada fila con:
 * - variants_summary (array de labels)
 * - stock_total      (sumatoria de variantes o legacy)
 * - stock_state      (low|medium|ok)
 *
 * Reglas default:
 *   low    si stock_total <= 5  ó (existe variante con stock <= 2)
 *   medium si 6..15
 *   ok     si > 15
 */
$out = [];
foreach ($rows as $r) {
  $hasVariants   = ((int)$r['v_count']) > 0;
  $labelsConcat  = $r['v_labels'];

  // variants_summary
  if ($hasVariants && $labelsConcat !== null && $labelsConcat !== '') {
    $variants_summary = explode('|||', $labelsConcat);
  } else {
    // compatibilidad con legacy: mostramos size o "Único"
    $variants_summary = [ trim($r['size']) !== '' ? $r['size'] : 'Único' ];
  }

  // stock_total (preferimos variantes si existen)
  $stock_total = $hasVariants
    ? (int)$r['v_stock_sum']
    : (int)$r['stock'];

  // estado
  $lowByTotal = ($stock_total <= 5);
  $lowByAny   = $hasVariants
    ? ((int)$r['v_stock_min'] <= 2)
    : ($stock_total <= 2);

  if ($lowByTotal || $lowByAny) {
    $stock_state = 'low';
  } elseif ($stock_total <= 15) {
    $stock_state = 'medium';
  } else {
    $stock_state = 'ok';
  }

  // armamos salida preservando tus campos originales
  $out[] = [
    'id'            => (int)$r['id'],
    'name'          => $r['name'],
    'slug'          => $r['slug'],
    'size'          => $r['size'],               // legacy
    'price'         => (float)$r['price'],
    'stock'         => (int)$r['stock'],         // legacy
    'category_id'   => $r['category_id'] !== null ? (int)$r['category_id'] : null,
    'category_name' => $r['category_name'],
    'image_path'    => $r['image_path'],
    'main_image'    => $r['main_image'],

    // nuevos
    'variants_summary' => $variants_summary,
    'stock_total'      => $stock_total,
    'stock_state'      => $stock_state,
  ];
}

json_ok($out);
