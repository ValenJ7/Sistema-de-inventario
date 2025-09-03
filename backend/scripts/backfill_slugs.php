<?php
// backend/scripts/backfill_slugs.php

// 1) Cargar env y helpers
$env = require __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../lib/slug_unique.php'; // este usa PDO internamente

header('Content-Type: text/plain; charset=utf-8');
$apply = ($_GET['apply'] ?? '0') === '1';

// 2) Crear PDO local (sin tocar tu $conn mysqli del proyecto)
$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = (int)($env['DB_PORT'] ?? 3307);
$name = $env['DB_NAME'] ?? 'sistema_de_inventario';
$user = $env['DB_USER'] ?? 'root';
$pass = $env['DB_PASS'] ?? '';

$dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo "ERROR conexión PDO: " . $e->getMessage() . "\n";
    exit;
}

// 3) Función de backfill (igual que antes)
function fillTable(PDO $pdo, string $table, string $idCol, string $nameCol) {
    echo "== $table ==\n";
    $rows = $pdo->query("SELECT $idCol AS id, $nameCol AS name, COALESCE(slug,'') AS slug FROM $table")
                ->fetchAll(PDO::FETCH_ASSOC);

    $upd = $pdo->prepare("UPDATE $table SET slug = :slug WHERE $idCol = :id");

    $pdo->beginTransaction();
    try {
        $updated = 0;
        foreach ($rows as $r) {
            $id = (int)$r['id'];
            $name = (string)$r['name'];
            $have = trim((string)$r['slug']);
            if ($have !== '') continue;

            if ($table === 'categories') $slug = uniqueCategorySlug($pdo, $name, $id);
            else                          $slug = uniqueProductSlug($pdo, $name, $id);

            echo "Row #$id: \"$name\" -> $slug\n";
            if ($GLOBALS['apply']) {
                $upd->execute([':slug' => $slug, ':id' => $id]);
                $updated++;
            }
        }
        if ($GLOBALS['apply']) {
            $pdo->commit();
            echo "[APPLY] $updated filas actualizadas en $table.\n";
        } else {
            $pdo->rollBack();
            echo "[DRY-RUN] Sin cambios.\n";
        }
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        echo "ERROR: " . $e->getMessage() . "\n";
    }
}

// 4) Ejecutar ambas tablas
fillTable($pdo, 'categories', 'id', 'name');
fillTable($pdo, 'products',   'id', 'name');

echo "Listo.\n";
