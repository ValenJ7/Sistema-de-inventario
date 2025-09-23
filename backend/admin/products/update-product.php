<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';
require __DIR__ . '/../../lib/strings.php';
require __DIR__ . '/../../lib/slug_unique_mysqli.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

// JSON o form
$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body) || empty($body)) $body = $_POST;

$id          = (int)($body['id'] ?? 0);
$name        = trim((string)($body['name'] ?? ''));
$priceRaw    = $body['price'] ?? null;
$categoryRaw = $body['category_id'] ?? null;

if ($id <= 0)             json_error('ID inválido', 400);
if ($name === '')         json_error('El nombre es requerido', 400);
if (!is_numeric($priceRaw)) json_error('El precio es inválido', 400);

$price = (float)$priceRaw;
if ($price < 0) json_error('price debe ser ≥ 0', 422);

// category_id nullable
$hasCategory = ($categoryRaw !== '' && $categoryRaw !== null);
if ($hasCategory && !is_numeric($categoryRaw)) json_error('category_id inválido', 400);
$categoryId = $hasCategory ? (int)$categoryRaw : null;

// Traer slug actual
$cur = $conn->prepare("SELECT slug FROM products WHERE id = ?");
if (!$cur) json_error('Error preparando consulta slug: '.$conn->error, 500);
$cur->bind_param('i', $id);
$cur->execute();
$cur->bind_result($currentSlug);
$cur->fetch();
$cur->close();

$needsSlug = (!$currentSlug || $currentSlug === '');

/**
 * Armamos UPDATE sin size/stock (las variantes se gestionan aparte)
 */
if ($categoryId === null) {
  if ($needsSlug) {
    $slug = uniqueProductSlugMysqli($conn, $name, $id);
    $sql  = "UPDATE products SET name = ?, slug = ?, price = ?, category_id = NULL WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) json_error('Error preparando update: '.$conn->error, 500);
    $stmt->bind_param('ssdi', $name, $slug, $price, $id);
  } else {
    $sql  = "UPDATE products SET name = ?, price = ?, category_id = NULL WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) json_error('Error preparando update: '.$conn->error, 500);
    $stmt->bind_param('sdi', $name, $price, $id);
  }
} else {
  if ($needsSlug) {
    $slug = uniqueProductSlugMysqli($conn, $name, $id);
    $sql  = "UPDATE products SET name = ?, slug = ?, price = ?, category_id = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) json_error('Error preparando update: '.$conn->error, 500);
    // name(s) slug(s) price(d) category_id(i) id(i)
    $stmt->bind_param('ssdii', $name, $slug, $price, $categoryId, $id);
  } else {
    $sql  = "UPDATE products SET name = ?, price = ?, category_id = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) json_error('Error preparando update: '.$conn->error, 500);
    $stmt->bind_param('sdii', $name, $price, $categoryId, $id);
  }
}

$ok = $stmt->execute();
$stmt->close();

if (!$ok) json_error('Error al actualizar: '.$conn->error, 500);
json_ok(true);
