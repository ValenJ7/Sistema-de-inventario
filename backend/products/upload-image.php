<?php
// backend/products/upload-image.php
require __DIR__ . '/../http/cors.php';
require __DIR__ . '/../http/json.php';
require __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

// Validar product_id
$productId = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
if ($productId <= 0) json_error("Falta 'product_id'");

// Comprobar que exista el producto
$chk = $conn->prepare("SELECT id FROM products WHERE id=?");
$chk->bind_param('i', $productId);
$chk->execute();
$exists = $chk->get_result()->fetch_assoc();
$chk->close();
if (!$exists) json_error('Producto no existe', 404);

// Validar archivo
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
  json_error('Archivo no recibido o con error');
}

$file = $_FILES['image'];
$maxBytes = 5 * 1024 * 1024; // 5 MB
if ($file['size'] > $maxBytes) json_error('El archivo excede 5 MB');

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowed = [
  'image/jpeg' => 'jpg',
  'image/png'  => 'png',
  'image/webp' => 'webp',
];
if (!isset($allowed[$mime])) json_error('Tipo de imagen no permitido (use jpg, png o webp)');

$ext = $allowed[$mime];

// Ruta de subida
$uploadDir = realpath(__DIR__ . '/..') . DIRECTORY_SEPARATOR . 'uploads';
if (!is_dir($uploadDir)) {
  if (!mkdir($uploadDir, 0775, true)) json_error('No se pudo crear carpeta uploads');
}

// Nombre único
$uuid = bin2hex(random_bytes(16));
$filename = $uuid . '.' . $ext;
$destPath = $uploadDir . DIRECTORY_SEPARATOR . $filename;

// Mover archivo
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
  json_error('No se pudo guardar el archivo');
}

// URL pública (relativa al backend)
$url = '/uploads/' . $filename;

// Insertar como sort_order 0 (principal por ahora)
$stmt = $conn->prepare("INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, 0)");
$stmt->bind_param('is', $productId, $url);
if (!$stmt->execute()) {
  @unlink($destPath);
  json_error('No se pudo registrar la imagen en BD', 500);
}
$imgId = $stmt->insert_id;
$stmt->close();

// Responder
json_ok(['id' => $imgId, 'url' => $url], 201);
