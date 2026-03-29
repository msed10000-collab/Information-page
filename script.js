function sendMsg() {
  let msg = msgTextarea.value.trim();
  if (msg === "") { alert("✏️ اكتب رسالة قبل الإرسال!"); return; }

  fetch('send.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msg: msg })
  })
  .then(res => res.json())
  .then(data => {
    if(data.status === "success"){
      alert("✅ تم إرسال رسالتك بنجاح (مجهولة)");
      msgTextarea.value = "";
    } else {
      alert("⚠️ فشل الإرسال: " + data.message);
    }
  })
  .catch(err => {
    console.error(err);
    alert("⚠️ حدث خطأ أثناء الإرسال");
  });
}
