<?php
require_once __DIR__ . '/../http/cors.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../http/json.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 🔹 Detalle de producto por slug (?slug=remera-azul)
    if (isset($_GET['slug'])) {
        $slug = $_GET['slug'];

        // Datos básicos del producto
        $stmt = $conn->prepare("SELECT p.id, p.name, p.slug, p.price, p.stock,
                                       (SELECT pi.url 
                                        FROM product_images pi 
                                        WHERE pi.product_id = p.id 
                                        ORDER BY pi.sort_order ASC LIMIT 1) as image
                                FROM products p
                                WHERE p.slug = ?");
        $stmt->bind_param("s", $slug);
        $stmt->execute();
        $result = $stmt->get_result();
        $product = $result->fetch_assoc();
        $stmt->close();

        if ($product) {
            // Todas las imágenes relacionadas
            $stmtImgs = $conn->prepare("SELECT id, url, sort_order 
                                        FROM product_images 
                                        WHERE product_id = ? 
                                        ORDER BY sort_order ASC");
            $stmtImgs->bind_param("i", $product['id']);
            $stmtImgs->execute();
            $resultImgs = $stmtImgs->get_result();

            $images = [];
            while ($row = $resultImgs->fetch_assoc()) {
                $images[] = $row;
            }
            $stmtImgs->close();

            // Agregar imágenes al producto
            $product['images'] = $images;

            json_ok($product);
        } else {
            http_response_code(404);
            json_error("Producto no encontrado");
        }

    } else {
        // 🔹 Listado con filtros y paginación
        $category = $_GET['category'] ?? null;
        $q        = $_GET['q'] ?? null;
        $page     = max(1, intval($_GET['page'] ?? 1));
        $size     = max(1, intval($_GET['size'] ?? 10));
        $offset   = ($page - 1) * $size;

        $sql = "SELECT p.id, p.name, p.slug, p.price, p.stock,
                       (SELECT pi.url 
                        FROM product_images pi 
                        WHERE pi.product_id = p.id 
                        ORDER BY pi.sort_order ASC LIMIT 1) as image
                FROM products p
                WHERE 1=1";
        $params = [];
        $types  = "";

        if ($category) {
            $sql .= " AND p.category_id = ?";
            $types .= "i";
            $params[] = $category;
        }
        if ($q) {
            $sql .= " AND p.name LIKE ?";
            $types .= "s";
            $params[] = "%$q%";
        }

        $sql .= " LIMIT ? OFFSET ?";
        $types .= "ii";
        $params[] = $size;
        $params[] = $offset;

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        $stmt->close();

        json_ok($products);
    }
} else {
    http_response_code(405);
    json_error("Método no permitido");
}
