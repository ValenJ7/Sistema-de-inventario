<?php
// backend/orders/webhook.php

require_once __DIR__ . "/../db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["data"]["id"])) {
    http_response_code(400);
    echo "Invalid webhook";
    exit;
}

$payment_id = $data["data"]["id"];

// Consultar pago en MP
$mp = require __DIR__ . "/../config/mercadopago.php";
require __DIR__ . "/../vendor/autoload.php";

use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\MercadoPagoConfig;

MercadoPagoConfig::setAccessToken($mp["ACCESS_TOKEN"]);
$client = new PaymentClient();
$payment = $client->get($payment_id);

$order_id = $payment->external_reference;
$status = $payment->status;

// Actualizar order
if ($status === "approved") {
    $stmt = $conn->prepare("UPDATE orders SET payment_status='paid' WHERE id=?");
    $stmt->bind_param("i", $order_id);
    $stmt->execute();
}

http_response_code(200);
echo "OK";
