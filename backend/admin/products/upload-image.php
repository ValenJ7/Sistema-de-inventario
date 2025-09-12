<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php'; // debe exponer $conn (mysqli)

try {
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
  }

  $productId = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
  if ($productId <= 0 || empty($_FILES['image']['tmp_name'])) {
    json_error('Faltan datos', 422);
  }

  // Validaciones básicas
  $maxBytes = 5 * 1024 * 1024; // 5MB
  if ($_FILES['image']['size'] > $maxBytes) {
    json_error('La imagen supera 5MB', 413);
  }

  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime  = $finfo->file($_FILES['image']['tmp_name']);
  $extMap = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
  if (!isset($extMap[$mime])) {
    json_error('Formato no permitido (jpg, png, webp)', 422);
  }

  // Paths
  $uploadDir  = __DIR__ . '/../uploads/products/';
  $publicBase = '/uploads/products/';

  if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0775, true)) {
      json_error('No se pudo crear el directorio de subida', 500);
    }
  }

  // Nombre único (evita caché): productId-timestamp-rand.ext
  $ext = $extMap[$mime];
  $filename = $productId . '-' . time() . '-' . bin2hex(random_bytes(3)) . '.' . $ext;
  $dest = $uploadDir . $filename;

  if (!move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
    json_error('No se pudo guardar la imagen', 500);
  }

  $publicPath = $publicBase . $filename;

  // 🔁 Marcar todas las imágenes previas como secundarias
  $upd = $conn->prepare("UPDATE product_images SET sort_order = 1 WHERE product_id = ?");
  $upd->bind_param('i', $productId);
  $upd->execute();
  $upd->close();

  // Insertar nueva como principal (sort_order = 0)
  $stmt = $conn->prepare("
    INSERT INTO product_images (product_id, url, sort_order, created_at)
    VALUES (?, ?, 0, NOW())
  ");
  if (!$stmt) {
    json_error('Error preparando SQL', 500);
  }
  $stmt->bind_param('is', $productId, $publicPath);
  if (!$stmt->execute()) {
    json_error('Error insertando imagen en DB', 500);
  }
  $stmt->close();

  // ✅ Éxito → devolver la url
  json_ok(['image_path' => $publicPath]);

} catch (Throwable $e) {
  // Nunca devolvemos HTML; siempre JSON
  json_error('Error del servidor: ' . $e->getMessage(), 500);
}
