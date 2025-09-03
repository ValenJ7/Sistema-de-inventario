<?php
function slugify(string $text, int $maxLen = 80): string {
  $text = iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$text); // translitera
  $text = strtolower($text ?? '');
  $text = preg_replace('/[^a-z0-9\s-]/', '', $text);
  $text = preg_replace('/[\s_-]+/', '-', trim($text));
  $text = trim($text, '-');
  return $text === '' ? 'item' : substr($text, 0, $maxLen);
}