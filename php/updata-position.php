<?php
$data = json_decode(file_get_contents('users-position-data.json'));

$ans = array();

$bool = false;

foreach($data as $user) {
    if((int)date("U") - (int)$user->last_updata < 30) {
        if($user->id == $_POST['id']) {
            $user->position = $_POST['position'];
            $bool = true;
        }
        array_push($ans, $user);
    }
}

if(!$bool) {
    array_push($ans, array(
        'id' => $_POST['id'],
        'last_updata' => date("U"),
        'position' => $_POST['position'],
        'set_meating' => $_POST['set_meating']
    ));
}

$text = json_encode($ans);

file_put_contents('users-position-data.json', $text);

echo $text;
?>