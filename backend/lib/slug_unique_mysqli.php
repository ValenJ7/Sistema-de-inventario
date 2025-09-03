<?php
require_once __DIR__ . '/strings.php';

function uniqueSlugForMysqli(mysqli $conn, string $table, string $name, ?int $ignoreId = null): string {
  $base = slugify($name);
  $slug = $base;
  $i = 2;

  $sql = "SELECT id FROM $table WHERE slug = ?" . ($ignoreId ? " AND id <> ?" : "") . " LIMIT 1";
  $stmt = $conn->prepare($sql);
  if (!$stmt) { throw new RuntimeException('No se pudo preparar verificación de slug'); }

  while (true) {
    if ($ignoreId) $stmt->bind_param('si', $slug, $ignoreId);
    else           $stmt->bind_param('s',  $slug);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 0) {
      $stmt->free_result();
      $stmt->close();
      return $slug;
    }
    $stmt->free_result();
    $slug = $base . '-' . $i++;
  }
}

function uniqueCategorySlugMysqli(mysqli $conn, string $name, ?int $ignoreId = null): string {
  return uniqueSlugForMysqli($conn, 'categories', $name, $ignoreId);
}
function uniqueProductSlugMysqli(mysqli $conn, string $name, ?int $ignoreId = null): string {
  return uniqueSlugForMysqli($conn, 'products', $name, $ignoreId);
}
