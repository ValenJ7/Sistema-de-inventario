<?php
// backend/lib/slug_unique.php
require_once __DIR__ . '/strings.php';

function uniqueSlugFor(PDO $pdo, string $table, string $name, ?int $ignoreId = null): string {
    $base = slugify($name);
    $slug = $base;
    $i = 2;

    $idCol = 'id'; // en tus tablas es id
    $sql = "SELECT $idCol FROM $table WHERE slug = :slug" . ($ignoreId ? " AND $idCol <> :id" : "") . " LIMIT 1";
    $stmt = $pdo->prepare($sql);

    while (true) {
        $stmt->bindValue(':slug', $slug);
        if ($ignoreId) $stmt->bindValue(':id', $ignoreId, PDO::PARAM_INT);
        $stmt->execute();
        if (!$stmt->fetchColumn()) return $slug;
        $slug = $base . '-' . $i++;
    }
}

function uniqueCategorySlug(PDO $pdo, string $name, ?int $ignoreId = null): string {
    return uniqueSlugFor($pdo, 'categories', $name, $ignoreId);
}
function uniqueProductSlug(PDO $pdo, string $name, ?int $ignoreId = null): string {
    return uniqueSlugFor($pdo, 'products', $name, $ignoreId);
}
