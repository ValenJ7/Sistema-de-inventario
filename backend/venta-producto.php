<?php
include 'db.php';
header('Content-Type: application/json');

// Verificar método PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(["error" => "Solo se permite el método PUT"]);
    exit;
}

// Leer el JSON del body
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['cantidad'])) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

$id = intval($data['id']);
$cantidad = intval($data['cantidad']);

// Verificar stock actual
$result = $conn->query("SELECT stock FROM products WHERE id = $id");
if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["error" => "Producto no encontrado"]);
    exit;
}

$row = $result->fetch_assoc();
$stock_actual = intval($row['stock']);

if ($cantidad > $stock_actual) {
    http_response_code(400);
    echo json_encode(["error" => "Stock insuficiente"]);
    exit;
}

// Descontar stock
$sql = "UPDATE products SET stock = stock - $cantidad WHERE id = $id";
if ($conn->query($sql) === TRUE) {
    echo json_encode(["message" => "Venta registrada, stock actualizado"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error al actualizar el stock"]);
}
?>
