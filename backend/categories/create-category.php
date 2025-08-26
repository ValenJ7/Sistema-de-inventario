<?php
require __DIR__ . '/../http/cors.php';
require __DIR__ . '/../http/json.php';
require __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) json_error('JSON inválido', 400);

$name = trim((string)($body['name'] ?? ''));
$description = trim((string)($body['description'] ?? ''));

if ($name === '') json_error('Falta el nombre', 400);

$stmt = $conn->prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
if (!$stmt) json_error('Error preparando insert', 500);
$stmt->bind_param('ss', $name, $description);

$ok = $stmt->execute();
if (!$ok) json_error('No se pudo crear', 500);
$newId = $stmt->insert_id;
$stmt->close();

json_ok(['id'=>$newId], 201);
