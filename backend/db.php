<?php
// ----------------------------------------------
// 🔌 db.php
// 🎯 Conexión MySQL (ajustá host/usuario/claves/puerto)
// ----------------------------------------------
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'sistema_de_inventario';
$port = 3307; // 👈 si tu MySQL usa 3307 (XAMPP a veces)

$conn = new mysqli($host, $user, $pass, $db, $port);
if ($conn->connect_error) {
  http_response_code(500);
  die('Error de conexión: ' . $conn->connect_error);
}
$conn->set_charset('utf8mb4');
