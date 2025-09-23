<?php
return [
  'DB_HOST'   => '127.0.0.1',
  'DB_PORT'   => 3307,
  'DB_USER'   => 'root',
  'DB_PASS'   => '',
  'DB_NAME'   => 'sistemainventario',

  // Para dev, * está bien
  'CORS_ALLOW_ORIGIN'  => '*',

  // AÑADE estos headers
  'CORS_ALLOW_HEADERS' => 'Content-Type, Authorization, X-Requested-With, Accept',

  // Incluye OPTIONS (y PATCH si algún endpoint lo usa)
  'CORS_ALLOW_METHODS' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
];
