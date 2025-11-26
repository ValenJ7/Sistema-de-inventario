<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

require_once __DIR__ . "/../../vendor/autoload.php";
require_once __DIR__ . "/../../config/env.php";
require_once __DIR__ . "/../../db.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

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

$body = json_decode(file_get_contents("php://input"), true);
$order_id = intval($body["order_id"] ?? 0);
$status = $body["shipping_status"] ?? "";

$allowed = ["pending","preparando","shipped","enviado","delivered","entregado","cancelled"];

if (!in_array($status, $allowed)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid status"]);
    exit;
}

$sql = "UPDATE orders SET shipping_status=? WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $order_id);
$stmt->execute();

echo json_encode(["success" => true, "message" => "Status updated"]);
