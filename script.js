document.addEventListener("DOMContentLoaded", function() {
  const sendButton = document.getElementById("sendBtn");
  const msgTextarea = document.getElementById("msg");
  const alertBox = document.getElementById("alertBox");

  sendButton.addEventListener("click", sendMsg);

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = "alert-box " + (type === "success" ? "alert-success" : "alert-error");
    alertBox.style.display = "block";
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 3000);
  }

  function sendMsg() {
    let msg = msgTextarea.value.trim();
    if (msg === "") {
      showAlert("✏️ اكتب رسالة قبل الإرسال!", "error");
      return;
    }

    const token = atob("ODQzOTM2MDU5MDpBQUZnazZ0NUJ0Sk5pUVBhQllJeDN4X1NzbjBpUFd5bzhubkk=");
    const chat_id = "6649939033";

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat_id, text: "📩 رسالة مجهولة:\n\n" + msg })
    })
    .then(res => {
      if (!res.ok) throw new Error("فشل الإرسال");
      showAlert("✅ تم إرسال رسالتك بنجاح (مجهولة المصدر)", "success");
      msgTextarea.value = "";
    })
    .catch(err => {
      console.error(err);
      showAlert("⚠️ حدث خطأ في الإرسال، حاول مرة أخرى.", "error");
    });
  }
});
