<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';
require __DIR__ . '/../../lib/strings.php';
require __DIR__ . '/../../lib/slug_unique_mysqli.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) json_error('JSON inválido', 400);

$id          = (int)($body['id'] ?? 0);
$name        = trim((string)($body['name'] ?? ''));
$size        = trim((string)($body['size'] ?? ''));
$price       = $body['price'] ?? null;
$stock       = $body['stock'] ?? null;
$categoryRaw = $body['category_id'] ?? null;

if ($id <= 0 || $name === '' || !is_numeric($price) || !is_numeric($stock)) {
  json_error('Datos inválidos', 400);
}

$price = (float)$price;
$stock = (int)$stock;
if ($price < 0) json_error('price debe ser ≥ 0', 422);
if ($stock < 0) json_error('stock debe ser ≥ 0', 422);

$hasCategory = ($categoryRaw !== '' && $categoryRaw !== null);
if ($hasCategory && !is_numeric($categoryRaw)) json_error('category_id inválido', 400);
$categoryId = $hasCategory ? (int)$categoryRaw : null;

// ¿ya tiene slug?
$cur = $conn->prepare("SELECT slug FROM products WHERE id = ?");
if (!$cur) json_error('Error preparando consulta slug', 500);
$cur->bind_param('i', $id);
$cur->execute();
$cur->bind_result($currentSlug);
$cur->fetch();
$cur->close();

$needsSlug = (!$currentSlug || $currentSlug === '');

if ($categoryId === null) {
  if ($needsSlug) {
    $slug = uniqueProductSlugMysqli($conn, $name, $id);
    $sql = "
      UPDATE products
      SET name = ?, slug = ?, size = ?, price = ?, stock = ?, category_id = NULL
      WHERE id = ?
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) json_error('Error preparando update', 500);
    // name(s), slug(s), size(s), price(d), stock(i), id(i)
    $stmt->bind_param('sssdii', $name, $slug, $size, $price, $stock, $id);
  } else {
    $sql = "
      UPDATE products
      SET name = ?, size = ?, price = ?, stock = ?, category_id = NULL
      WHERE id = ?
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) json_error('Error preparando update', 500);
    // name(s), size(s), price(d), stock(i), id(i)
    $stmt->bind_param('ssdii', $name, $size, $price, $stock, $id);
  }
} else {
  if ($needsSlug) {
    $slug = uniqueProductSlugMysqli($conn, $name, $id);
    $sql = "
      UPDATE products
      SET name = ?, slug = ?, size = ?, price = ?, stock = ?, category_id = ?
      WHERE id = ?
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) json_error('Error preparando update', 500);
    // name(s), slug(s), size(s), price(d), stock(i), category_id(i), id(i)
    $stmt->bind_param('sssdi ii', $name, $slug, $size, $price, $stock, $categoryId, $id);
    // Nota: algunos editores rompen el espacio en la cadena de tipos.
    // Debe ser exactamente: 'sssdiii'
  } else {
    $sql = "
      UPDATE products
      SET name = ?, size = ?, price = ?, stock = ?, category_id = ?
      WHERE id = ?
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) json_error('Error preparando update', 500);
    // name(s), size(s), price(d), stock(i), category_id(i), id(i)
    $stmt->bind_param('ssdiii', $name, $size, $price, $stock, $categoryId, $id);
  }
}

$ok = $stmt->execute();
$stmt->close();

if (!$ok) json_error('Error al actualizar', 500);
json_ok(true);
