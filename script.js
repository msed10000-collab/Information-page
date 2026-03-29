// انتظار تحميل DOM بالكامل
document.addEventListener("DOMContentLoaded", function() {
  const sendButton = document.getElementById("sendBtn");
  const msgTextarea = document.getElementById("msg");

  sendButton.addEventListener("click", sendMsg);

  function sendMsg() {
    let msg = msgTextarea.value.trim();

    if (msg === "") {
      alert("✏️ اكتب رسالة قبل الإرسال!");
      return;
    }

    // التوكن والمعرف الخاصين بالبوت (مشفى base64)
    const token = atob("ODQzOTM2MDU5MDpBQUZnazZ0NUJ0Sk5pUVBhQllJeDN4X1NzbjBpUFd5bzhubkk=");
    const chat_id = "6649939033";

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat_id,
        text: "📩 رسالة مجهولة:\n\n" + msg
      })
    })
    .then(response => {
      if (!response.ok) throw new Error("فشل الإرسال");
      alert("✅ تم إرسال رسالتك بنجاح (مجهولة المصدر)");
      msgTextarea.value = "";
    })
    .catch(error => {
      console.error(error);
      alert("⚠️ حدث خطأ في الإرسال، حاول مرة أخرى.");
    });
  }
});