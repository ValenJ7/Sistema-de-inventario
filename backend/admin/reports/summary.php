<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

$from = $_GET['from'] ?? null;
$to   = $_GET['to']   ?? null;

if (!$from || !$to) {
  $to = date('Y-m-d');
  $from = date('Y-m-d', strtotime($to.' -6 days'));
}
if (strtotime($from) === false || strtotime($to) === false) json_error('Fechas inválidas', 400);
if (strtotime($from) > strtotime($to)) json_error('from > to', 400);

$dtStart = $from.' 00:00:00';
$dtEnd   = date('Y-m-d', strtotime($to.' +1 day')).' 00:00:00';

$orders = 0; $total_amount = 0.0; $items = 0;

$stmt = $conn->prepare("SELECT COUNT(*) AS orders, COALESCE(SUM(total),0) AS total_amount FROM sales WHERE created_at >= ? AND created_at < ?");
$stmt->bind_param("ss", $dtStart, $dtEnd);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$orders = (int)($res['orders'] ?? 0);
$total_amount = (float)($res['total_amount'] ?? 0);
$stmt->close();

$stmt = $conn->prepare("
  SELECT COALESCE(SUM(si.quantity),0) AS items
  FROM sale_items si
  INNER JOIN sales s ON s.id = si.sale_id
  WHERE s.created_at >= ? AND s.created_at < ?
");
$stmt->bind_param("ss", $dtStart, $dtEnd);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$items = (int)($res['items'] ?? 0);
$stmt->close();

$avg_ticket = $orders > 0 ? $total_amount / $orders : 0;

json_ok([
  'total_amount' => $total_amount,
  'orders'       => $orders,
  'items'        => $items,
  'avg_ticket'   => $avg_ticket,
]);
