<?php
require __DIR__ . '/../../http/cors.php';
require __DIR__ . '/../../http/json.php';
require __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Método no permitido', 405);

$from      = $_GET['from'] ?? null;
$to        = $_GET['to']   ?? null;
$page      = max(1, (int)($_GET['page'] ?? 1));
$pageSize  = max(1, min((int)($_GET['page_size'] ?? 25), 100));

if (!$from || !$to) {
  $to = date('Y-m-d');
  $from = date('Y-m-d', strtotime($to.' -6 days'));
}
if (strtotime($from) === false || strtotime($to) === false) json_error('Fechas inválidas', 400);
if (strtotime($from) > strtotime($to)) json_error('from > to', 400);

$dtStart = $from.' 00:00:00';
$dtEnd   = date('Y-m-d', strtotime($to.' +1 day')).' 00:00:00';
$offset  = ($page - 1) * $pageSize;

# total_rows
$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM sales s WHERE s.created_at >= ? AND s.created_at < ?");
$stmt->bind_param("ss", $dtStart, $dtEnd);
$stmt->execute();
$totalRows = (int)($stmt->get_result()->fetch_assoc()['c'] ?? 0);
$stmt->close();

# rows con items_count
$sql = "
  SELECT
    s.id,
    s.created_at,
    s.total,
    COALESCE(SUM(si.quantity),0) AS items_count
  FROM sales s
  LEFT JOIN sale_items si ON si.sale_id = s.id
  WHERE s.created_at >= ? AND s.created_at < ?
  GROUP BY s.id
  ORDER BY s.created_at DESC, s.id DESC
  LIMIT ? OFFSET ?
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssii", $dtStart, $dtEnd, $pageSize, $offset);
$stmt->execute();
$res = $stmt->get_result();

$rows = [];
while ($r = $res->fetch_assoc()) {
  $rows[] = [
    'id'         => (int)$r['id'],
    'created_at' => $r['created_at'],
    'total'      => (float)$r['total'],
    'items_count'=> (int)$r['items_count'],
  ];
}
$stmt->close();

json_ok(['rows' => $rows, 'total_rows' => $totalRows]);
