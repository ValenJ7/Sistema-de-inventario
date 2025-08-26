
<?php
include '../db.php';
header('Content-Type: application/json');

// Asegurar que el método sea PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Solo se permite el método PUT"]);
    exit;
}

// Leer el cuerpo del request
$data = json_decode(file_get_contents("php://input"), true);

// Validación
if (!isset($data['id']) || !isset($data['cantidad'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$id = intval($data['id']);
$cantidad = intval($data['cantidad']);

$sql = "UPDATE products SET stock = stock + $cantidad WHERE id = $id";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Stock actualizado correctamente"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo actualizar el stock"]);
}
?>
