<?php
require_once __DIR__ . '/../http/cors.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../http/json.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT id, name, slug FROM categories ORDER BY name ASC";
    $result = $conn->query($sql);

    if (!$result) {
        http_response_code(500);
        json_error("Error en la consulta: " . $conn->error);
    }

    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }

    json_ok($categories);
} else {
    http_response_code(405);
    json_error("Método no permitido");
}
