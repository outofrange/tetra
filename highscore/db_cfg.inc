<?php
$host = '';
$port = '';
$user = '';
$pass = '';
$name = '';

$conn = new mysqli($host, $user, $pass, $name, $port);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}