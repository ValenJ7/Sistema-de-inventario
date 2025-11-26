<?php
// ===== CORS =====
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// ===== VALIDAR MÉTODO =====
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

require_once __DIR__ . "/../../vendor/autoload.php";
require_once __DIR__ . "/../../config/env.php";
require_once __DIR__ . "/../../db.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// ===== VALIDAR JWT =====
$headers = getallheaders();
$auth = $headers["Authorization"] ?? null;

if (!$auth || !str_starts_with($auth, "Bearer ")) {
    http_response_code(401);
    echo json_encode(["error" => "Missing or invalid token"]);
    exit;
}

try {
    $token = substr($auth, 7);
    $decoded = JWT::decode($token, new Key($env["JWT_SECRET"], "HS256"));
    if ($decoded->role !== "admin") {
        http_response_code(403);
        echo json_encode(["error" => "Access denied"]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit;
}

$order_id = intval($_GET["id"]);

// ===== OBTENER LA ORDEN =====
$sql_order = "
    SELECT 
        o.*,
        u.name AS customer_name,
        u.email AS customer_email
    FROM orders o
    INNER JOIN users u ON u.id = o.user_id
    WHERE o.id = ?
";

$stmt = $conn->prepare($sql_order);
$stmt->bind_param("i", $order_id);
$stmt->execute();
$order = $stmt->get_result()->fetch_assoc();

if (!$order) {
    http_response_code(404);
    echo json_encode(["error" => "Order not found"]);
    exit;
}

// ===== OBTENER ITEMS =====
$sql_items = "
    SELECT 
        oi.quantity,
        oi.price,
        oi.subtotal,
        p.name AS product_name
    FROM order_items oi
    INNER JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
";

$stmt = $conn->prepare($sql_items);
$stmt->bind_param("i", $order_id);
$stmt->execute();
$items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// ===== RESPUESTA =====
echo json_encode([
    "success" => true,
    "data" => [
        "order" => $order,
        "items" => $items
    ]
]);
