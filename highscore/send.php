<?php
require_once("db_cfg.inc");

$name = $_POST["name"];
$score = $_POST["score"];

$stmt = $conn->prepare("INSERT INTO games_highscore (name, score) VALUES (?, ?)");
$stmt->bind_param("si", $name, $score);
$result = $stmt->execute();

if ($result === false) {
    die("Couldn't update table");
}

$conn->close();