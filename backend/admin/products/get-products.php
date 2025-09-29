<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

/**
 * Parámetros
 */
$q           = isset($_GET['q']) ? trim((string)$_GET['q']) : '';
$category_id = isset($_GET['category_id']) && $_GET['category_id'] !== '' ? (int)$_GET['category_id'] : null;
$stock       = isset($_GET['stock']) ? $_GET['stock'] : 'any'; // any|in|out
$hidden      = isset($_GET['hidden']) ? $_GET['hidden'] : 'any'; // 0|1|any (si no tenés columna, dejá 'any')

$sort        = isset($_GET['sort']) ? $_GET['sort'] : 'created_at'; // name|price|stock_total|created_at
$order       = (isset($_GET['order']) && strtolower($_GET['order']) === 'asc') ? 'ASC' : 'DESC';
$page        = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit       = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 20;
$offset      = ($page - 1) * $limit;

/**
 * Mapeo de sort seguro (¡alias T en la externa!)
 */
$sortMap = [
  'name'        => 'T.name',
  'price'       => 'T.price',
  'created_at'  => 'T.created_at',
];
$sortCol = $sortMap[$sort] ?? 'T.created_at';

/**
 * Subquery base que calcula variantes + stock_total
 */
$baseSelect = "
  SELECT
    p.id,
    p.name,
    p.slug,
    p.size,
    p.price,
    p.stock,
    p.category_id,
    c.name AS category_name,
    p.created_at,
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

    (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) AS v_count,
    (SELECT COALESCE(SUM(v2.stock), 0) FROM product_variants v2 WHERE v2.product_id = p.id) AS v_stock_sum,
    (SELECT MIN(v3.stock) FROM product_variants v3 WHERE v3.product_id = p.id) AS v_stock_min,
    (SELECT GROUP_CONCAT(v4.label ORDER BY v4.sort_order ASC, v4.id ASC SEPARATOR '|||')
       FROM product_variants v4
       WHERE v4.product_id = p.id) AS v_labels,
    (SELECT GROUP_CONCAT(CONCAT(v5.label, ':', v5.stock)
            ORDER BY v5.sort_order ASC, v5.id ASC SEPARATOR '|||')
       FROM product_variants v5
       WHERE v5.product_id = p.id) AS v_label_stock,

    CASE
      WHEN (SELECT COUNT(*) FROM product_variants v6 WHERE v6.product_id = p.id) > 0
        THEN (SELECT COALESCE(SUM(v7.stock), 0) FROM product_variants v7 WHERE v7.product_id = p.id)
      ELSE p.stock
    END AS stock_total

    /* Si TENÉS columna is_hidden, podés agregarla y filtrar más abajo:
       , p.is_hidden
    */
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
";

/**
 * WHERE dinámico sobre p.*
 */
$where = [];
$bind  = [];
$type  = '';

if ($q !== '') {
  $qLower = function_exists('mb_strtolower') ? mb_strtolower($q, 'UTF-8') : strtolower($q);
  $where[] = "LOWER(p.name) LIKE ?";
  $bind[]  = '%' . $qLower . '%';
  $type   .= 's';
}
if ($category_id !== null) {
  $where[] = "p.category_id = ?";
  $bind[]  = $category_id;
  $type   .= 'i';
}

/* Filtro hidden (solo si existe la columna is_hidden en tu BD)
if ($hidden === '0') { $where[] = "p.is_hidden = 0"; }
elseif ($hidden === '1') { $where[] = "p.is_hidden = 1"; }
*/

$whereSql = count($where) ? (' WHERE ' . implode(' AND ', $where)) : '';

/**
 * Subconsulta con filtros simples
 */
$subsql = "($baseSelect $whereSql) AS T";

/**
 * Filtro por stock_total sobre la externa
 */
$having = '';
if ($stock === 'in')   $having = 'WHERE T.stock_total > 0';
if ($stock === 'out')  $having = 'WHERE T.stock_total <= 0';

/**
 * Orden (si es stock_total, ordenar por el derivado)
 */
$orderSql = $sort === 'stock_total'
  ? "ORDER BY T.stock_total $order, T.id DESC"
  : "ORDER BY $sortCol $order, T.id DESC";

/**
 * COUNT con mismas condiciones
 */
$countSql = "SELECT COUNT(*) AS total FROM $subsql $having";
$stmt = $conn->prepare($countSql);
if (!$stmt) json_error('Error preparando COUNT: ' . $conn->error, 500);
if ($type !== '') $stmt->bind_param($type, ...$bind);
if (!$stmt->execute()) json_error('Error ejecutando COUNT: ' . $stmt->error, 500);
$res  = $stmt->get_result();
$row  = $res ? $res->fetch_assoc() : ['total' => 0];
$total = (int)($row['total'] ?? 0);
$stmt->close();

/**
 * Query de datos paginada
 */
$dataSql = "
  SELECT
    T.*,
    CASE WHEN T.stock_total > 0 THEN 'in' ELSE 'out' END AS stock_state
  FROM $subsql
  $having
  $orderSql
  LIMIT ? OFFSET ?
";

$stmt = $conn->prepare($dataSql);
if (!$stmt) json_error('Error preparando consulta: ' . $conn->error, 500);

/* bind_param dinámico */
$bindTypes = $type . 'ii';
$bindVals  = $bind;
$bindVals[] = $limit;
$bindVals[] = $offset;

$stmt->bind_param($bindTypes, ...$bindVals);

if (!$stmt->execute()) json_error('Error ejecutando consulta: ' . $stmt->error, 500);
$res  = $stmt->get_result();
$rows = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
$stmt->close();

/**
 * Post-proceso (igual que antes)
 */
$out = [];
foreach ($rows as $r) {
  $hasVariants  = ((int)$r['v_count']) > 0;
  $labelsConcat = $r['v_labels'] ?? null;
  $pairsConcat  = $r['v_label_stock'] ?? null;

  $variants_detail = [];
  $variants_summary = [];

  if ($hasVariants && $pairsConcat !== null && $pairsConcat !== '') {
    $pairs = explode('|||', $pairsConcat);
    foreach ($pairs as $pair) {
      [$label, $qty] = array_pad(explode(':', $pair, 2), 2, '');
      $label = trim((string)$label);
      if ($label === '') continue;
      $stock = is_numeric($qty) ? (int)$qty : null;
      $variants_detail[] = ['label' => $label, 'stock' => $stock];
      $variants_summary[] = $label;
    }
  } elseif ($hasVariants && $labelsConcat !== null && $labelsConcat !== '') {
    $variants_summary = array_values(
      array_filter(array_map('trim', explode('|||', $labelsConcat)), fn($x) => $x !== '')
    );
  } else {
    $labelLegacy = trim((string)($r['size'] ?? ''));
    if ($labelLegacy === '') $labelLegacy = 'Único';
    $variants_detail   = [['label' => $labelLegacy, 'stock' => (int)$r['stock']]];
    $variants_summary  = [$labelLegacy];
  }

  $stock_total = (int)$r['stock_total'];
  $stock_state = ($stock_total > 0) ? 'in' : 'out';

  $out[] = [
    'id'            => (int)$r['id'],
    'name'          => $r['name'],
    'slug'          => $r['slug'],
    'size'          => $r['size'],
    'price'         => (float)$r['price'],
    'stock'         => (int)$r['stock'],
    'category_id'   => $r['category_id'] !== null ? (int)$r['category_id'] : null,
    'category_name' => $r['category_name'] ?? null,
    'image_path'    => $r['image_path'] ?? null,
    'main_image'    => $r['main_image'] ?? null,
    'variants_detail'  => $variants_detail,
    'variants_summary' => $variants_summary,
    'stock_total'      => $stock_total,
    'stock_state'      => $stock_state,
  ];
}

json_ok([
  'items'    => $out,
  'total'    => $total,
  'page'     => $page,
  'per_page' => $limit,
]);
