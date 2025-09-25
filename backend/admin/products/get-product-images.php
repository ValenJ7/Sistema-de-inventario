<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php'; // debe exponer $conn (mysqli)

try {
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
  if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Método no permitido', 405);
  }

  $productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : 0;
  if ($productId <= 0) {
    json_error('Falta product_id válido', 422);
  }

  $stmt = $conn->prepare("
    SELECT id, url, sort_order, is_main, created_at
    FROM product_images
    WHERE product_id = ?
    ORDER BY sort_order ASC, created_at DESC
  ");
  if (!$stmt) json_error('Error preparando SQL', 500);

  $stmt->bind_param('i', $productId);
  $stmt->execute();
  $res = $stmt->get_result();
  $images = [];
  while ($row = $res->fetch_assoc()) {
  $images[] = [
    'id'         => (int)$row['id'],
    'url'        => $row['url'],
    'sort_order' => (int)$row['sort_order'],
    'is_main'    => (int)$row['is_main'],
    'created_at' => $row['created_at'],
    ];
  }
  $stmt->close();

  json_ok($images);

} catch (Throwable $e) {
  json_error('Error del servidor: ' . $e->getMessage(), 500);
}
