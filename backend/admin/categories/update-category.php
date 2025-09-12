<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';
require __DIR__ . '/../../lib/strings.php';
require __DIR__ . '/../../lib/slug_unique_mysqli.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') json_error('Método no permitido', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) json_error('JSON inválido', 400);

$id   = (int)($body['id'] ?? 0);
$name = trim((string)($body['name'] ?? ''));
$description = trim((string)($body['description'] ?? ''));

if ($id <= 0 || $name === '') json_error('Faltan campos', 400);

// ¿ya tiene slug?
$cur = $conn->prepare("SELECT slug FROM categories WHERE id = ?");
if (!$cur) json_error('Error preparando consulta slug', 500);
$cur->bind_param('i', $id);
$cur->execute();
$cur->bind_result($currentSlug);
$cur->fetch();
$cur->close();

if (!$currentSlug || $currentSlug === '') {
  // dato viejo sin slug → generarlo ahora
  $slug = uniqueCategorySlugMysqli($conn, $name, $id);
  $stmt = $conn->prepare("UPDATE categories SET name = ?, description = ?, slug = ? WHERE id = ?");
  if (!$stmt) json_error('Error preparando update', 500);
  $stmt->bind_param('sssi', $name, $description, $slug, $id);
} else {
  // slug estable → no tocar
  $stmt = $conn->prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?");
  if (!$stmt) json_error('Error preparando update', 500);
  $stmt->bind_param('ssi', $name, $description, $id);
}

$ok = $stmt->execute();
$stmt->close();

if (!$ok) json_error('No se pudo actualizar', 500);
json_ok(true);
