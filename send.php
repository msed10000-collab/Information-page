<?php
// send.php

$data = json_decode(file_get_contents('php://input'), true);

if(isset($data['msg'])){
    $token = "8439360590:AAFgk6t5BtJNiQPaBYI3x_Ssn0iPWyo8nnI"; // بوتك
    $chat_id = "6649939033"; // آي ديك
    $msg = $data['msg'];

    $url = "https://api.telegram.org/bot$token/sendMessage";
    $post_fields = [
        'chat_id' => $chat_id,
        'text' => "📩 رسالة مجهولة:\n\n".$msg
    ];

    $ch = curl_init(); 
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    echo json_encode(['status'=>'success', 'response'=>$response]);
}else{
    echo json_encode(['status'=>'error', 'message'=>'لا توجد رسالة']);
}
?>
