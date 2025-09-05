<?php
require __DIR__ . '/../http/cors.php';
require __DIR__ . '/../http/json.php';
require __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

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
    (
      SELECT pi.url
      FROM product_images pi
      WHERE pi.product_id = p.id
      ORDER BY pi.sort_order ASC, pi.id ASC
      LIMIT 1
    ) AS main_image
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  ORDER BY p.created_at DESC, p.id DESC
";
$stmt = $conn->prepare($sql);
if (!$stmt) json_error('Error preparando consulta', 500);

$stmt->execute();
$res = $stmt->get_result();
$rows = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
$stmt->close();

json_ok($rows);
