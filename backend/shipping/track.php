<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET");

if (!isset($_GET["code"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing tracking code"]);
    exit;
}

$code = $_GET["code"];
$url = "https://www.correoargentino.com.ar/track/tracking/$code";

// =======================
// Obtener HTML
// =======================
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$html = curl_exec($ch);
curl_close($ch);

if (!$html) {
    echo json_encode(["error" => "Tracking unavailable"]);
    exit;
}

// =======================
// Parsear HTML
// =======================
libxml_use_internal_errors(true);
$dom = new DOMDocument();
$dom->loadHTML($html);
libxml_clear_errors();

$xpath = new DOMXPath($dom);

// Estado actual
$statusNode = $xpath->query("//div[contains(@class,'tracking-status')]/p");
$status = $statusNode->length ? trim($statusNode->item(0)->textContent) : "No disponible";

// Historial
$history = [];

$rows = $xpath->query("//table[contains(@class, 'table')]/tbody/tr");

if ($rows->length > 0) {
    foreach ($rows as $row) {

        // obtener columnas usando XPath (más seguro)
        $cols = $xpath->query("./td", $row);

        if ($cols->length >= 3) {
            $history[] = [
                "date" => trim($cols->item(0)->textContent),
                "location" => trim($cols->item(1)->textContent),
                "status" => trim($cols->item(2)->textContent),
            ];
        }
    }
}



// Respuesta
echo json_encode([
    "tracking_number" => $code,
    "status" => $status,
    "history" => $history
]);
