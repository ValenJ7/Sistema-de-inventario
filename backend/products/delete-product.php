<?php
require __DIR__ . '/../http/cors.php';
require __DIR__ . '/../http/json.php';
require __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') json_error('Método no permitido', 405);

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) json_error('ID inválido', 400);

$stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
if (!$stmt) json_error('Error preparando delete', 500);
$stmt->bind_param('i', $id);

$ok = $stmt->execute();
$stmt->close();

if (!$ok) json_error('No se pudo eliminar', 500);
json_ok(true);
