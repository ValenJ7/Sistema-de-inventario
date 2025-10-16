<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

$input = json_decode(file_get_contents("php://input"), true);
if (!$input || !isset($input['items']) || !is_array($input['items']) || count($input['items']) === 0) {
  json_error("Datos inválidos", 400);
}

$items = $input['items'];

/* Consolidar por product_id + variant_id */
$byKey = [];
foreach ($items as $it) {
  if (!isset($it['product_id'], $it['quantity'])) json_error("Item inválido", 400);

  $pid = (int)$it['product_id'];
  $qty = max(1, (int)$it['quantity']);
  $vid = isset($it['variant_id']) && $it['variant_id'] !== null ? (int)$it['variant_id'] : null;

  $key = $pid . '|' . ($vid ?? 'null');
  if (!isset($byKey[$key])) $byKey[$key] = ['product_id' => $pid, 'variant_id' => $vid, 'quantity' => 0];
  $byKey[$key]['quantity'] += $qty;
}
$items = array_values($byKey);

$conn->begin_transaction();
try {
  $saleItems = [];
  $total = 0.0;

  foreach ($items as &$it) {
    $pid = $it['product_id'];
    $vid = $it['variant_id'];
    $qty = $it['quantity'];

    if ($vid !== null) {
      // Variante específica
      $stmt = $conn->prepare("
        SELECT v.id AS variant_id, v.label, v.stock, p.price
        FROM product_variants v
        JOIN products p ON p.id = v.product_id
        WHERE v.id = ? AND p.id = ?
        FOR UPDATE
      ");
      $stmt->bind_param("ii", $vid, $pid);
      $stmt->execute();
      $row = $stmt->get_result()->fetch_assoc();
      $stmt->close();

      if (!$row) throw new Exception("Variante $vid no encontrada para producto $pid");
      if ((int)$row['stock'] < $qty) throw new Exception("Stock insuficiente para talle {$row['label']}");

      $price = (float)$row['price'];
      $subtotal = $price * $qty;
      $saleItems[] = [
        'product_id' => $pid,
        'variant_id' => $vid,
        'size'       => $row['label'],
        'quantity'   => $qty,
        'price'      => $price,
        'subtotal'   => $subtotal,
      ];
      $total += $subtotal;

      // Descontar stock de la variante
      $stmt = $conn->prepare("UPDATE product_variants SET stock = stock - ? WHERE id = ?");
      $stmt->bind_param("ii", $qty, $vid);
      $stmt->execute();
      $stmt->close();

    } else {
      // Producto sin variantes
      $stmt = $conn->prepare("SELECT price, stock, COALESCE(size,'') AS size FROM products WHERE id = ? FOR UPDATE");
      $stmt->bind_param("i", $pid);
      $stmt->execute();
      $row = $stmt->get_result()->fetch_assoc();
      $stmt->close();

      if (!$row) throw new Exception("Producto $pid no encontrado");
      if ((int)$row['stock'] < $qty) throw new Exception("Stock insuficiente para producto $pid");

      $price = (float)$row['price'];
      $subtotal = $price * $qty;
      $saleItems[] = [
        'product_id' => $pid,
        'variant_id' => null,
        'size'       => $row['size'],
        'quantity'   => $qty,
        'price'      => $price,
        'subtotal'   => $subtotal,
      ];
      $total += $subtotal;

      $stmt = $conn->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
      $stmt->bind_param("ii", $qty, $pid);
      $stmt->execute();
      $stmt->close();
    }
  }
  unset($it);

  // Insertar venta
  $stmt = $conn->prepare("INSERT INTO sales (total) VALUES (?)");
  $stmt->bind_param("d", $total);
  $stmt->execute();
  $saleId = $stmt->insert_id;
  $stmt->close();

  // Insertar ítems
  foreach ($saleItems as $s) {
    $stmt = $conn->prepare("
      INSERT INTO sale_items (sale_id, product_id, size, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("iisidd", $saleId, $s['product_id'], $s['size'], $s['quantity'], $s['price'], $s['subtotal']);
    $stmt->execute();
    $stmt->close();
  }

  $conn->commit();
  json_ok(["sale_id" => $saleId, "total" => $total, "items" => $saleItems]);

} catch (Exception $e) {
  $conn->rollback();
  json_error("Error registrando venta: " . $e->getMessage(), 500);
}
