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

  // Leer datos (acepta JSON o form-data)
  $input = $_POST;
  if (empty($input)) {
    $raw = file_get_contents("php://input");
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) $input = $decoded;
  }

  $productId = isset($input['product_id']) ? (int)$input['product_id'] : 0;
  $imageId   = isset($input['image_id'])   ? (int)$input['image_id']   : 0;

  if ($productId <= 0 || $imageId <= 0) {
    json_error('Falta product_id o image_id', 422);
  }

  // Validar que la imagen pertenece al producto
  $stmt = $conn->prepare("SELECT id FROM product_images WHERE id = ? AND product_id = ?");
  $stmt->bind_param('ii', $imageId, $productId);
  $stmt->execute();
  $res = $stmt->get_result();
  $img = $res->fetch_assoc();
  $stmt->close();

  if (!$img) {
    json_error('Imagen no encontrada para este producto', 404);
  }

  // Marcar todas como secundarias
  $conn->query("UPDATE product_images SET is_main = 0 WHERE product_id = $productId");

  // Marcar la elegida como principal
  $upd = $conn->prepare("UPDATE product_images SET is_main = 1 WHERE id = ? AND product_id = ?");
  $upd->bind_param('ii', $imageId, $productId);
  $upd->execute();
  $upd->close();

  json_ok(['main_set' => true, 'product_id' => $productId, 'image_id' => $imageId]);

} catch (Throwable $e) {
  json_error('Error del servidor: '.$e->getMessage(), 500);
}
