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

// ===== DEPENDENCIAS =====
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

// ===== CONSULTA =====
$sql = "
    SELECT 
        o.id,
        o.total,
        o.payment_status,
        o.shipping_status,
        o.created_at,
        u.name AS customer_name,
        u.email AS customer_email
    FROM orders o
    INNER JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
";

$result = $conn->query($sql);
$orders = [];

while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}

// ===== RESPUESTA =====
echo json_encode([
    "success" => true,
    "data" => $orders,
]);
