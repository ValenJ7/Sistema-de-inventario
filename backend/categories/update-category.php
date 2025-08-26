<?php
require __DIR__ . '/../http/cors.php';
require __DIR__ . '/../http/json.php';
require __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') json_error('Método no permitido', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) json_error('JSON inválido', 400);

$id   = (int)($body['id'] ?? 0);
$name = trim((string)($body['name'] ?? ''));
$description = trim((string)($body['description'] ?? ''));

if ($id <= 0 || $name === '') json_error('Faltan campos', 400);

$stmt = $conn->prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?");
if (!$stmt) json_error('Error preparando update', 500);
$stmt->bind_param('ssi', $name, $description, $id);

$ok = $stmt->execute();
$stmt->close();

if (!$ok) json_error('No se pudo actualizar', 500);
json_ok(true);
