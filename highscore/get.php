<?php
require_once("db_cfg.inc");

$sql = "SELECT name, score FROM games_highscore ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

$highscore = array();
while($r = mysqli_fetch_assoc($result)) {
    $highscore[] = $r;
}
print json_encode($highscore);

$conn->close();