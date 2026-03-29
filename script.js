// إعدادات البوت (تم إدخال بياناتك)
const BOT_TOKEN = '8439360590:AAFgk6t5BtJNiQPaBYI3x_Ssn0iPWyo8nnI';
const CHAT_ID = '6649939033';

// عناصر الصفحة
const sendBtn = document.getElementById('sendBtn');
const msgInput = document.getElementById('msg');
const alertBox = document.getElementById('alertBox');

let isSending = false;

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert-box alert-${type}`;
  alertBox.style.display = 'block';
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 4000);
}

sendBtn.addEventListener('click', async () => {
  const message = msgInput.value.trim();
  if (!message) {
    showAlert('✏️ الرجاء كتابة رسالة أولاً', 'error');
    return;
  }
  if (isSending) return;
  isSending = true;
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> جاري الإرسال...';

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHAT_ID,
    text: `📩 رسالة جديدة من الزائر:\n\n${message}`,
    parse_mode: 'HTML'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (data.ok) {
      showAlert('✅ تم إرسال رسالتك بنجاح! شكراً لك', 'success');
      msgInput.value = '';
    } else {
      console.error(data);
      showAlert('❌ فشل الإرسال، تأكد من التوكن والمعرف', 'error');
    }
  } catch (error) {
    console.error(error);
    showAlert('⚠️ خطأ في الاتصال، حاول مرة أخرى', 'error');
  } finally {
    isSending = false;
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال';
  }
});
