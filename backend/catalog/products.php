<?php
require_once __DIR__ . '/../http/cors.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../http/json.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    json_error("Método no permitido");
}

$slug = $_GET['slug'] ?? null;
$page = max(1, intval($_GET['page'] ?? 1));
$size = max(1, intval($_GET['size'] ?? 8));
$category = $_GET['category'] ?? null;
$q = $_GET['q'] ?? null;

// ===================================================
// 🔹 DETALLE (por slug)
// ===================================================
if ($slug) {
    $stmt = $conn->prepare("SELECT * FROM products WHERE slug = ? LIMIT 1");
    $stmt->bind_param("s", $slug);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        json_error("Producto no encontrado");
    }

    $product = $result->fetch_assoc();

    // Imágenes
    $imgStmt = $conn->prepare("
        SELECT id, url, is_main, sort_order 
        FROM product_images 
        WHERE product_id = ? 
        ORDER BY is_main DESC, sort_order ASC, id ASC
    ");
    $imgStmt->bind_param("i", $product['id']);
    $imgStmt->execute();
    $imgRes = $imgStmt->get_result();
    $images = [];
    while ($row = $imgRes->fetch_assoc()) $images[] = $row;
    $product['images'] = $images;

    // Variantes (talles)
    $varStmt = $conn->prepare("
        SELECT id, product_id, label, sku, stock, sort_order
        FROM product_variants
        WHERE product_id = ?
        ORDER BY sort_order ASC, id ASC
    ");
    $varStmt->bind_param("i", $product['id']);
    $varStmt->execute();
    $varRes = $varStmt->get_result();
    $variants = [];
    $totalStock = 0;
    while ($row = $varRes->fetch_assoc()) {
        $variants[] = $row;
        $totalStock += intval($row['stock']);
    }
    $product['variants'] = $variants;
    $product['stock'] = $totalStock; // 👈 el stock global viene de variants

    json_ok($product);
}

// ===================================================
// 🔹 LISTADO (con filtros y stock calculado)
// ===================================================
$where = "1=1";
$params = [];
$types = "";

if ($category) {
    $where .= " AND category_id = ?";
    $params[] = $category;
    $types .= "i";
}
if ($q) {
    $where .= " AND name LIKE ?";
    $params[] = "%" . $q . "%";
    $types .= "s";
}

$limit = $size;
$offset = ($page - 1) * $size;

$sql = "SELECT id, name, price, stock, slug FROM products WHERE $where ORDER BY id DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;
$types .= "ii";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

// Si hay productos, sumamos el stock real desde product_variants
if (count($products) > 0) {
    $ids = array_column($products, 'id');
    $in = implode(',', array_fill(0, count($ids), '?'));

    // 🔸 Traemos stock por variant
    $varSql = "SELECT product_id, SUM(stock) AS total_stock 
               FROM product_variants 
               WHERE product_id IN ($in) 
               GROUP BY product_id";
    $varStmt = $conn->prepare($varSql);
    $varStmt->bind_param(str_repeat("i", count($ids)), ...$ids);
    $varStmt->execute();
    $varRes = $varStmt->get_result();

    $stockByProduct = [];
    while ($s = $varRes->fetch_assoc()) {
        $stockByProduct[$s['product_id']] = intval($s['total_stock']);
    }

    // 🔸 Agregamos imagen principal
    $imgSql = "SELECT product_id, url 
               FROM product_images 
               WHERE product_id IN ($in) 
               AND is_main = 1";
    $imgStmt = $conn->prepare($imgSql);
    $imgStmt->bind_param(str_repeat("i", count($ids)), ...$ids);
    $imgStmt->execute();
    $imgRes = $imgStmt->get_result();

    $imgByProduct = [];
    while ($img = $imgRes->fetch_assoc()) {
        $imgByProduct[$img['product_id']] = $img['url'];
    }

    // 🔸 Fusionamos todo
    foreach ($products as &$p) {
        $p['stock'] = $stockByProduct[$p['id']] ?? 0;
        $p['image'] = $imgByProduct[$p['id']] ?? null;
    }
}

json_ok($products);
