<?php
// backend/orders/create.php



header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../db.php";
$env = require __DIR__ . "/../config/env.php";
$mp = require __DIR__ . "/../config/mercadopago.php";

require __DIR__ . "/../vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

// === VALIDAR JWT ===
$headers = getallheaders();
$auth = $headers["Authorization"] ?? "";

if (!$auth) {
    http_response_code(401);
    echo json_encode(["error" => "Token requerido"]);
    exit;
}

try {
    $token = str_replace("Bearer ", "", $auth);
    $decoded = JWT::decode($token, new Key($env["JWT_SECRET"], "HS256"));
    $user_id = $decoded->id;
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["error" => "Token inválido o expirado"]);
    exit;
}

// === LEER BODY ===
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "JSON inválido"]);
    exit;
}

$items = $data["items"] ?? [];
$address = trim($data["address"] ?? "");
$city = trim($data["city"] ?? "");
$province = trim($data["province"] ?? "");
$postal_code = trim($data["postal_code"] ?? "");

if (empty($items) || !$address || !$city || !$postal_code) {
    http_response_code(400);
    echo json_encode(["error" => "Faltan datos"]);
    exit;
}

// === CALCULAR TOTAL ===
$total = 0;
foreach ($items as $it) {
    $total += $it["price"] * $it["qty"];
}

// === INSERTAR ORDER ===
$stmt = $conn->prepare("
    INSERT INTO orders (user_id, total, address, city, province, postal_code, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
");
$stmt->bind_param("idssss", $user_id, $total, $address, $city, $province, $postal_code);
$stmt->execute();
$order_id = $stmt->insert_id;

// === INSERTAR ITEMS ===
$stmtItem = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
foreach ($items as $it) {
    $stmtItem->bind_param("iiid", $order_id, $it["id"], $it["qty"], $it["price"]);
    $stmtItem->execute();
}

// === MERCADOPAGO: CREAR PREFERENCIA ===
MercadoPagoConfig::setAccessToken($mp["ACCESS_TOKEN"]);
$client = new PreferenceClient();

$mp_items = [];
foreach ($items as $it) {
    $mp_items[] = [
        "title" => $it["name"],
        "quantity" => $it["qty"],
        "unit_price" => (float)$it["price"],
        "currency_id" => "ARS"
    ];
}

$preference_data = [
    "items" => $mp_items,
    "external_reference" => (string)$order_id,
    "back_urls" => [
        "success" => "http://localhost:5173/checkout/success",
        "failure" => "http://localhost:5173/checkout/failure",
        "pending" => "http://localhost:5173/checkout/pending",
    ],
    "notification_url" => "http://localhost/SistemaDeInventario/backend/orders/webhook.php"
];

$preference = $client->create($preference_data);

// === RESPUESTA ===
echo json_encode([
    "message" => "Pedido creado y preferencia generada",
    "order_id" => $order_id,
    "mp_init_point" => $preference->init_point, // link real sandbox
    "sandbox_init_point" => $preference->sandbox_init_point
]);
