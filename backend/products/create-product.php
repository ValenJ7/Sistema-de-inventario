<?php
require __DIR__ . '/../http/cors.php';
require __DIR__ . '/../http/json.php';
require __DIR__ . '/../db.php';
require __DIR__ . '/../lib/strings.php';
require __DIR__ . '/../lib/slug_unique_mysqli.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) json_error('JSON inválido', 400);

$name        = trim((string)($body['name'] ?? ''));
$size        = trim((string)($body['size'] ?? ''));
$price       = $body['price'] ?? null;
$stock       = $body['stock'] ?? null;
$categoryRaw = $body['category_id'] ?? null;

if ($name === '' || !is_numeric($price) || !is_numeric($stock)) {
  json_error('Faltan campos obligatorios o tipos inválidos (name, price, stock)', 400);
}

$price = (float)$price;
$stock = (int)$stock;
if ($price < 0) json_error('price debe ser ≥ 0', 422);
if ($stock < 0) json_error('stock debe ser ≥ 0', 422);

$hasCategory = ($categoryRaw !== '' && $categoryRaw !== null);
if ($hasCategory && !is_numeric($categoryRaw)) json_error('category_id inválido', 400);
$categoryId = $hasCategory ? (int)$categoryRaw : null;

// 🎯 slug único desde name
$slug = uniqueProductSlugMysqli($conn, $name);

if ($categoryId === null) {
  $sql = "INSERT INTO products (name, slug, category_id, size, price, stock) VALUES (?, ?, NULL, ?, ?, ?)";
  $stmt = $conn->prepare($sql);
  if (!$stmt) json_error('Error preparando insert', 500);
  // name(s), slug(s), size(s), price(d), stock(i)
  $stmt->bind_param('sssdi', $name, $slug, $size, $price, $stock);
} else {
  $sql = "INSERT INTO products (name, slug, category_id, size, price, stock) VALUES (?, ?, ?, ?, ?, ?)";
  $stmt = $conn->prepare($sql);
  if (!$stmt) json_error('Error preparando insert', 500);
  // name(s), slug(s), category_id(i), size(s), price(d), stock(i)
  $stmt->bind_param('ssisdi', $name, $slug, $categoryId, $size, $price, $stock);
}

$ok = $stmt->execute();
if (!$ok) json_error('Error al insertar producto', 500);
$newId = $stmt->insert_id;
$stmt->close();

json_ok(['id' => $newId, 'slug' => $slug, 'message' => 'Producto agregado'], 201);
