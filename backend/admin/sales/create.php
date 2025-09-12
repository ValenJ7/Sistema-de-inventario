<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

// Leer JSON
$input = json_decode(file_get_contents("php://input"), true);
if (!$input || !isset($input['items']) || !is_array($input['items']) || count($input['items']) === 0) {
    json_error("Datos inválidos", 400);
}

$items = $input['items'];
$total = 0;
foreach ($items as $it) {
    if (!isset($it['product_id'], $it['quantity'])) {
        json_error("Item inválido", 400);
    }
}

// Transacción
$conn->begin_transaction();

try {
    // Calcular total desde DB (para evitar precios manipulados)
    foreach ($items as &$it) {
        $pid = (int)$it['product_id'];
        $qty = (int)$it['quantity'];

        $stmt = $conn->prepare("SELECT price, stock FROM products WHERE id = ?");
        $stmt->bind_param("i", $pid);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$res) throw new Exception("Producto $pid no encontrado");
        if ($res['stock'] < $qty) throw new Exception("Stock insuficiente para producto $pid");

        $it['price'] = (float)$res['price'];
        $it['subtotal'] = $it['price'] * $qty;
        $total += $it['subtotal'];
    }

    // Insertar venta
    $stmt = $conn->prepare("INSERT INTO sales (total) VALUES (?)");
    $stmt->bind_param("d", $total);
    $stmt->execute();
    $saleId = $stmt->insert_id;
    $stmt->close();

    // Insertar ítems y actualizar stock
    foreach ($items as $it) {
        $stmt = $conn->prepare("INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("iiidd", $saleId, $it['product_id'], $it['quantity'], $it['price'], $it['subtotal']);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        $stmt->bind_param("ii", $it['quantity'], $it['product_id']);
        $stmt->execute();
        $stmt->close();
    }

    $conn->commit();
    json_ok(["sale_id" => $saleId, "total" => $total, "items" => $items]);

} catch (Exception $e) {
    $conn->rollback();
    json_error("Error registrando venta: " . $e->getMessage(), 500);
}
