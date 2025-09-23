<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

/* Traemos productos + imágenes + agregados de variantes mediante subconsultas */
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

    /* imagen principal (primera por sort_order, luego id) */
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

    /* agregados de variantes */
    (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) AS v_count,
    (SELECT COALESCE(SUM(v2.stock), 0) FROM product_variants v2 WHERE v2.product_id = p.id) AS v_stock_sum,
    (SELECT MIN(v3.stock) FROM product_variants v3 WHERE v3.product_id = p.id) AS v_stock_min,
    (SELECT GROUP_CONCAT(v4.label ORDER BY v4.sort_order ASC, v4.id ASC SEPARATOR '|||')
       FROM product_variants v4
       WHERE v4.product_id = p.id) AS v_labels,
    (SELECT GROUP_CONCAT(CONCAT(v5.label, ':', v5.stock)
            ORDER BY v5.sort_order ASC, v5.id ASC SEPARATOR '|||')
       FROM product_variants v5
       WHERE v5.product_id = p.id) AS v_label_stock
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  ORDER BY p.created_at DESC, p.id DESC
";

$stmt = $conn->prepare($sql);
if (!$stmt) json_error('Error preparando consulta: ' . $conn->error, 500);
if (!$stmt->execute()) json_error('Error ejecutando consulta: ' . $stmt->error, 500);

$res  = $stmt->get_result();
$rows = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
$stmt->close();

/* Enriquecemos cada fila */
$out = [];
foreach ($rows as $r) {
  $hasVariants  = ((int)$r['v_count']) > 0;
  $labelsConcat = $r['v_labels'];
  $pairsConcat  = $r['v_label_stock'];

  /* variants_detail [{label, stock}] y variants_summary [label] */
  $variants_detail = [];
  $variants_summary = [];

  if ($hasVariants && $pairsConcat !== null && $pairsConcat !== '') {
    $pairs = explode('|||', $pairsConcat);
    foreach ($pairs as $pair) {
      [$label, $qty] = array_pad(explode(':', $pair, 2), 2, '');
      $label = trim((string)$label);
      if ($label === '') continue; // evita ":"
      $stock = is_numeric($qty) ? (int)$qty : null;
      $variants_detail[] = ['label' => $label, 'stock' => $stock];
      $variants_summary[] = $label;
    }
  } elseif ($hasVariants && $labelsConcat !== null && $labelsConcat !== '') {
    // solo labels (por compat)
    $variants_summary = array_values(
      array_filter(array_map('trim', explode('|||', $labelsConcat)), fn($x) => $x !== '')
    );
  } else {
    // legacy: sin variantes → usar size y/o stock plano
    $labelLegacy = trim((string)$r['size']);
    if ($labelLegacy === '') $labelLegacy = 'Único';
    $variants_detail   = [['label' => $labelLegacy, 'stock' => (int)$r['stock']]];
    $variants_summary  = [$labelLegacy];
  }

  /* stock_total (preferimos sumatoria de variantes) */
  $stock_total = $hasVariants ? (int)$r['v_stock_sum'] : (int)$r['stock'];

  /* estado binario */
  $stock_state = ($stock_total > 0) ? 'in' : 'out';

  /* salida */
  $out[] = [
    'id'            => (int)$r['id'],
    'name'          => $r['name'],
    'slug'          => $r['slug'],
    'size'          => $r['size'],                               // legacy
    'price'         => (float)$r['price'],
    'stock'         => (int)$r['stock'],                         // legacy
    'category_id'   => $r['category_id'] !== null ? (int)$r['category_id'] : null,
    'category_name' => $r['category_name'],
    'image_path'    => $r['image_path'],
    'main_image'    => $r['main_image'],

    'variants_detail'  => $variants_detail,   // 👈 label + stock
    'variants_summary' => $variants_summary,  // 👈 solo labels
    'stock_total'      => $stock_total,
    'stock_state'      => $stock_state,
  ];
}

json_ok($out);
