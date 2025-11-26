<?php
// backend/orders/webhook.php

require_once __DIR__ . "/../db.php";

header("Content-Type: text/plain");

// === LOGGING (para debug) ===
$logFile = __DIR__ . "/webhook.log";
function logMP($msg) {
    global $logFile;
    file_put_contents($logFile, "[" . date("Y-m-d H:i:s") . "] " . $msg . "\n", FILE_APPEND);
}

// === Leer payload recibido ===
$raw = file_get_contents("php://input");
logMP("RAW: " . $raw);

$data = json_decode($raw, true);

if (!$data || !isset($data["data"]["id"])) {
    logMP("❌ Invalid webhook payload");
    http_response_code(400);
    exit("Invalid payload");
}

$payment_id = $data["data"]["id"];
logMP("📦 Payment ID recibido: $payment_id");

// === Cargar MercadoPago SDK ===
$mp = require __DIR__ . "/../config/mercadopago.php";
require __DIR__ . "/../vendor/autoload.php";

use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\MercadoPagoConfig;

// === Config MP ===
MercadoPagoConfig::setAccessToken($mp["ACCESS_TOKEN"]);
$client = new PaymentClient();

// === Obtener datos completos del pago ===
try {
    $payment = $client->get($payment_id);
} catch (Exception $e) {
    logMP("❌ Error al obtener pago: " . $e->getMessage());
    http_response_code(200);
    exit("OK"); // evitar reintentos
}

$order_id = $payment->external_reference;
$status = $payment->status;

logMP("🔍 Pago obtenido → order_id=$order_id, status=$status");

// === Actualizar estado según MercadoPago ===
switch ($status) {

    case "approved":
        $stmt = $conn->prepare("UPDATE orders SET payment_status='paid' WHERE id=?");
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
        logMP("✅ Order $order_id marcada como PAGADA");
        break;

    case "pending":
        $stmt = $conn->prepare("UPDATE orders SET payment_status='pending' WHERE id=?");
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
        logMP("⏳ Order $order_id marcada como PENDIENTE");
        break;

    case "rejected":
        $stmt = $conn->prepare("UPDATE orders SET payment_status='failed' WHERE id=?");
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
        logMP("❌ Order $order_id marcada como FALLIDA");
        break;
}

http_response_code(200);
echo "OK";
logMP("---- FIN ----");
