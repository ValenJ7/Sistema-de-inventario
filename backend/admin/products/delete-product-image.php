<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Aceptar POST y DELETE
$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST' && $method !== 'DELETE') {
  json_error('Método no permitido', 405);
}

// Obtener $id desde JSON, x-www-form-urlencoded, DELETE body o query
$raw = file_get_contents('php://input');
$asJson = json_decode($raw, true);
$asForm = [];
if ($asJson === null) {
  // Si no es JSON, puede ser urlencoded en body (especialmente en DELETE)
  parse_str($raw, $asForm);
}

$id = 0;
// Prioridades: JSON.image_id -> form.image_id -> POST.image_id -> GET.id / GET.image_id
$id = intval($asJson['image_id'] ?? $asForm['image_id'] ?? $_POST['image_id'] ?? $_GET['id'] ?? $_GET['image_id'] ?? 0);

if ($id <= 0) {
  json_error('Falta image_id', 422);
}

// Usa $conn o $mysqli según tengas en db.php
// Asumo $conn (porque lo usabas en este archivo)
$stmt = $conn->prepare("SELECT url, product_id, sort_order FROM product_images WHERE id = ?");
$stmt->bind_param('i', $id);
$stmt->execute();
$res = $stmt->get_result();
$img = $res->fetch_assoc();
$stmt->close();

if (!$img) {
  json_error('Imagen no encontrada', 404);
}

// Borrar archivo físico (si la url es /uploads/xxx.jpg)
// Ajustá la base si tu árbol es distinto. realpath para mayor seguridad.
$relative = $img['url'] ?? '';
$root = realpath(__DIR__ . '/../../..'); // /backend/admin/products -> subo 3 niveles al proyecto
$fullPath = $root && $relative ? realpath($root . $relative) : false;

// Evitar borrar fuera del proyecto si realpath falla
if ($fullPath && is_file($fullPath) && str_starts_with($fullPath, $root)) {
  @unlink($fullPath);
}

// Borrar en DB
$del = $conn->prepare("DELETE FROM product_images WHERE id = ?");
$del->bind_param('i', $id);
$ok = $del->execute();
$del->close();

if (!$ok) {
  json_error('No se pudo borrar la imagen', 500);
}

json_ok(['deleted' => true, 'id' => $id]);
