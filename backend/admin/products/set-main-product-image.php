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

  $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
  if ($id <= 0) {
    json_error('Falta id de imagen', 422);
  }

  // Buscar la imagen
  $stmt = $conn->prepare("SELECT product_id FROM product_images WHERE id = ?");
  $stmt->bind_param('i', $id);
  $stmt->execute();
  $res = $stmt->get_result();
  $img = $res->fetch_assoc();
  $stmt->close();

  if (!$img) {
    json_error('Imagen no encontrada', 404);
  }

  $productId = $img['product_id'];

  // Poner todas como secundarias
  $upd = $conn->prepare("UPDATE product_images SET sort_order = 1 WHERE product_id = ?");
  $upd->bind_param('i', $productId);
  $upd->execute();
  $upd->close();

  // Poner la elegida como principal
  $upd2 = $conn->prepare("UPDATE product_images SET sort_order = 0 WHERE id = ?");
  $upd2->bind_param('i', $id);
  $upd2->execute();
  $upd2->close();

  json_ok(['main_set' => true, 'id' => $id]);

} catch (Throwable $e) {
  json_error('Error del servidor: ' . $e->getMessage(), 500);
}
