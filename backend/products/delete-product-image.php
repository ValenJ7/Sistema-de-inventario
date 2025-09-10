<?php
require __DIR__ . '/../http/cors.php';
require __DIR__ . '/../http/json.php';
require __DIR__ . '/../db.php';

try {
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
  if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_error('Método no permitido', 405);
  }

  $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
  if ($id <= 0) {
    json_error('Falta id de imagen', 422);
  }

  // Obtener la ruta de la imagen
  $stmt = $conn->prepare("SELECT url, product_id, sort_order FROM product_images WHERE id = ?");
  $stmt->bind_param('i', $id);
  $stmt->execute();
  $res = $stmt->get_result();
  $img = $res->fetch_assoc();
  $stmt->close();

  if (!$img) {
    json_error('Imagen no encontrada', 404);
  }

  // Borrar archivo físico
  $filePath = __DIR__ . '/..' . $img['url'];
  if (is_file($filePath)) {
    unlink($filePath);
  }

  // Borrar de DB
  $del = $conn->prepare("DELETE FROM product_images WHERE id = ?");
  $del->bind_param('i', $id);
  $del->execute();
  $del->close();

  json_ok(['deleted' => true, 'id' => $id]);

} catch (Throwable $e) {
  json_error('Error del servidor: ' . $e->getMessage(), 500);
}
