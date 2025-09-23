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

// 1️⃣ Consolidar productos repetidos (mismo product_id + size)
$byKey = [];
foreach ($items as $it) {
    if (!isset($it['product_id'], $it['quantity'])) {
        json_error("Item inválido", 400);
    }

    $pid  = (int)$it['product_id'];
    $qty  = (int)$it['quantity'];
    $size = isset($it['size']) ? (string)$it['size'] : '';

    $key = $pid . '|' . $size;
    if (!isset($byKey[$key])) {
        $byKey[$key] = ['product_id' => $pid, 'size' => $size, 'quantity' => 0];
    }
    $byKey[$key]['quantity'] += $qty;
}
$items = array_values($byKey);

$conn->begin_transaction();

try {
    $total = 0;

    // 2️⃣ Validar stock y calcular totales
    foreach ($items as $idx => $it) {
        $pid = $it['product_id'];
        $qty = $it['quantity'];

        $stmt = $conn->prepare("SELECT price, stock, size FROM products WHERE id = ?");
        $stmt->bind_param("i", $pid);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$res) throw new Exception("Producto $pid no encontrado");
        if ((int)$res['stock'] < $qty) throw new Exception("Stock insuficiente para producto $pid");

        $price    = (float)$res['price'];
        $size     = $it['size'] !== '' ? $it['size'] : ($res['size'] ?? '');
        if ($size === null) $size = '';
        $subtotal = $price * $qty;

        $items[$idx]['price']    = $price;
        $items[$idx]['size']     = $size;
        $items[$idx]['subtotal'] = $subtotal;

        $total += $subtotal;
    }

    // 3️⃣ Insertar venta
    $stmt = $conn->prepare("INSERT INTO sales (total) VALUES (?)");
    $stmt->bind_param("d", $total);
    $stmt->execute();
    $saleId = $stmt->insert_id;
    $stmt->close();

    // 4️⃣ Insertar ítems y actualizar stock
    foreach ($items as $it) {
        $stmt = $conn->prepare("
          INSERT INTO sale_items (sale_id, product_id, size, quantity, price, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param(
            "iisidd",
            $saleId,
            $it['product_id'],
            $it['size'],
            $it['quantity'],
            $it['price'],
            $it['subtotal']
        );
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
