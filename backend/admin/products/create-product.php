<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';
require __DIR__ . '/../../lib/strings.php';
require __DIR__ . '/../../lib/slug_unique_mysqli.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

// Leer JSON (fallback a form-data)
$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body) || empty($body)) $body = $_POST;

// Campos
$name        = trim((string)($body['name'] ?? ''));
$priceRaw    = $body['price'] ?? null;
$categoryRaw = $body['category_id'] ?? null;

// Estos ahora son OPCIONALES (legacy)
$sizeRaw     = $body['size'] ?? null;
$stockRaw    = $body['stock'] ?? null;

// Validaciones mínimas
if ($name === '')        json_error('El nombre es requerido', 400);
if (!is_numeric($priceRaw)) json_error('El precio es inválido', 400);

$price = (float)$priceRaw;
if ($price < 0) json_error('price debe ser ≥ 0', 422);

// category_id nullable
$hasCategory = ($categoryRaw !== '' && $categoryRaw !== null);
if ($hasCategory && !is_numeric($categoryRaw)) json_error('category_id inválido', 400);
$categoryId = $hasCategory ? (int)$categoryRaw : null;

// Legacy opcional: si no llegan, los dejamos nulos/0 (ya usamos product_variants)
$size  = isset($sizeRaw)  ? trim((string)$sizeRaw) : null;
$size  = ($size === '') ? null : $size;

// Para evitar problemas de bind con null en INT, dejemos 0 por defecto
$stock = (isset($stockRaw) && $stockRaw !== '' && is_numeric($stockRaw)) ? (int)$stockRaw : 0;
if ($stock < 0) $stock = 0;

// Slug único desde name
$slug = uniqueProductSlugMysqli($conn, $name);

// Insert
if ($categoryId === null) {
  $sql = "INSERT INTO products (name, slug, category_id, size, price, stock, created_at)
          VALUES (?, ?, NULL, ?, ?, ?, NOW())";
  $stmt = $conn->prepare($sql);
  if (!$stmt) json_error('Error preparando insert: '.$conn->error, 500);
  // name(s), slug(s), size(s|null), price(d), stock(i)
  $stmt->bind_param('sssdi', $name, $slug, $size, $price, $stock);
} else {
  $sql = "INSERT INTO products (name, slug, category_id, size, price, stock, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())";
  $stmt = $conn->prepare($sql);
  if (!$stmt) json_error('Error preparando insert: '.$conn->error, 500);
  // name(s), slug(s), category_id(i), size(s|null), price(d), stock(i)
  $stmt->bind_param('ssisdi', $name, $slug, $categoryId, $size, $price, $stock);
}

$ok = $stmt->execute();
if (!$ok) json_error('Error al insertar producto: '.$stmt->error, 500);

$newId = $stmt->insert_id;
$stmt->close();

json_ok(['id' => $newId, 'slug' => $slug, 'message' => 'Producto agregado'], 201);
