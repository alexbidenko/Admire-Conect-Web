<?php
$old_data = file_get_contents('all_posts_data.json');
$got_data = json_decode($_POST['data']);

$ans = array();

foreach($old_data as $user) {
    if($user->user_id != $got_data->user_id) {
        array_push($ans, $user);
    }
}
array_push($ans, $got_data);
file_put_contents('all_posts_data.json', json_encode($ans));
echo "well";
?>