<?php
function json_ok($data=null, int $code=200){
  http_response_code($code);
  echo json_encode(['success'=>true,'data'=>$data,'error'=>null], JSON_UNESCAPED_UNICODE);
  exit;
}
function json_error(string $msg, int $code=400){
  http_response_code($code);
  echo json_encode(['success'=>false,'data'=>null,'error'=>$msg], JSON_UNESCAPED_UNICODE);
  exit;
}

function body_json(){
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function as_int($v,$field,$min=null,$max=null){
  if(!is_numeric($v)) json_error("El campo '$field' debe ser entero.");
  $i=(int)$v;
  if($min!==null && $i<$min) json_error("El campo '$field' debe ser ≥ $min.");
  if($max!==null && $i>$max) json_error("El campo '$field' debe ser ≤ $max.");
  return $i;
}
function as_decimal($v,$field,$min=null,$max=null){
  if(!is_numeric($v)) json_error("El campo '$field' debe ser numérico.");
  $f=(float)$v;
  if($min!==null && $f<$min) json_error("El campo '$field' debe ser ≥ $min.");
  if($max!==null && $f>$max) json_error("El campo '$field' debe ser ≤ $max.");
  return $f;
}
function as_string($v,$field,$maxLen=255){
  if(!is_string($v)) json_error("El campo '$field' debe ser string.");
  $s=trim($v);
  if($s==='') json_error("El campo '$field' no puede estar vacío.");
  if(mb_strlen($s)>$maxLen) json_error("El campo '$field' supera $maxLen caracteres.");
  return $s;
}
