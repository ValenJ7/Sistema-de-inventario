<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

try {
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
  }

  // 📥 Leer body (puede venir en JSON)
  $input = file_get_contents("php://input");
  $data = json_decode($input, true);

  if (!isset($data['orders']) || !is_array($data['orders'])) {
    json_error('Falta parámetro orders', 422);
  }

  $conn->begin_transaction();

  $stmt = $conn->prepare("UPDATE product_images SET sort_order = ? WHERE id = ?");
  if (!$stmt) {
    json_error('Error preparando SQL', 500);
  }

  foreach ($data['orders'] as $item) {
    $id = isset($item['id']) ? (int)$item['id'] : 0;
    $sortOrder = isset($item['sort_order']) ? (int)$item['sort_order'] : 0;

    if ($id > 0) {
      $stmt->bind_param('ii', $sortOrder, $id);
      $stmt->execute();
    }
  }

  $stmt->close();
  $conn->commit();

  json_ok(['reordered' => true]);

} catch (Throwable $e) {
  if ($conn && $conn->errno) {
    $conn->rollback();
  }
  json_error('Error del servidor: ' . $e->getMessage(), 500);
}
