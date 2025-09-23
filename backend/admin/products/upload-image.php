<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

// product_id
$productId = isset($_POST['product_id']) ? (int)$_POST['product_id'] : 0;
if ($productId <= 0) json_error('product_id inválido', 400);

// archivo
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
  json_error('Archivo no subido', 400);
}

$root = realpath(__DIR__ . '/../../');                   // .../backend
$uploadDir = $root . '/uploads/products/';               // físico
if (!is_dir($uploadDir)) {
  if (!mkdir($uploadDir, 0775, true)) {
    json_error('No se pudo crear directorio de uploads', 500);
  }
}

// validar extensión/MIME simple
$info = pathinfo($_FILES['image']['name']);
$ext  = strtolower($info['extension'] ?? 'jpg');
$allowed = ['jpg','jpeg','png','webp'];
if (!in_array($ext, $allowed, true)) $ext = 'jpg';

// nombre único
$random = bin2hex(random_bytes(3));
$filename = $productId . '-' . time() . '-' . $random . '.' . $ext;
$destPath = $uploadDir . $filename;
if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
  json_error('No se pudo mover el archivo', 500);
}

// URL pública que el front usará (NO incluye /backend porque se concatena con BACKEND_BASE)
$publicUrl = '/uploads/products/' . $filename;

// guardar en DB (sort_order al final)
$stmt = $conn->prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 FROM product_images WHERE product_id = ?");
$stmt->bind_param('i', $productId);
$stmt->execute();
$stmt->bind_result($nextOrder);
$stmt->fetch();
$stmt->close();

$ins = $conn->prepare("INSERT INTO product_images (product_id, url, sort_order, created_at) VALUES (?, ?, ?, NOW())");
if (!$ins) json_error('Error preparando insert imagen: '.$conn->error, 500);
$ins->bind_param('isi', $productId, $publicUrl, $nextOrder);
if (!$ins->execute()) json_error('Error insertando imagen: '.$ins->error, 500);
$imgId = $ins->insert_id;
$ins->close();

json_ok(['id' => $imgId, 'url' => $publicUrl]);
