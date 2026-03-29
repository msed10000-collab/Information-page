// إعدادات البوت
const BOT_TOKEN = '8439360590:AAFgk6t5BtJNiQPaBYI3x_Ssn0iPWyo8nnI';
const CHAT_ID = '6649939033';

// عناصر الصفحة
const sendBtn = document.getElementById('sendBtn');
const msgInput = document.getElementById('msg');
const alertBox = document.getElementById('alertBox');

let isSending = false;

function showAlert(message, type, isPermanent = false) {
  alertBox.textContent = message;
  alertBox.className = `alert-box alert-${type}`;
  alertBox.style.display = 'block';
  if (!isPermanent) {
    setTimeout(() => {
      if (alertBox.style.display === 'block') alertBox.style.display = 'none';
    }, 6000);
  }
}

// دالة اختبار الاتصال بالبوت عند تحميل الصفحة
async function testBotConnection() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.ok) {
      console.log('✅ البوت يعمل:', data.result.username);
      // اختبار إرسال رسالة تجريبية
      const testUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const testPayload = {
        chat_id: CHAT_ID,
        text: '🔄 تم تفعيل نظام الرسائل بنجاح! هذه رسالة اختبارية.',
      };
      const testResponse = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      const testData = await testResponse.json();
      if (testData.ok) {
        console.log('✅ رسالة الاختبار وصلت إلى التلغرام');
      } else {
        console.error('❌ فشل إرسال رسالة الاختبار:', testData);
        showAlert('⚠️ تنبيه: البوت يعمل لكن المعرف (Chat ID) قد يكون خاطئاً. تأكد من إرسال رسالة للبوت أولاً.', 'error', true);
      }
    } else {
      console.error('❌ التوكن غير صالح:', data);
      showAlert('❌ التوكن غير صحيح! راجع التوكن.', 'error', true);
    }
  } catch (error) {
    console.error('خطأ في الاتصال بالبوت:', error);
    showAlert('⚠️ لا يمكن الاتصال بخادم التلغرام. تحقق من اتصالك بالإنترنت.', 'error', true);
  }
}

// تشغيل الاختبار عند تحميل الصفحة
testBotConnection();

// حدث إرسال الرسالة
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
      console.error('خطأ من التلغرام:', data);
      let errorMsg = '❌ فشل الإرسال: ';
      if (data.description.includes('chat not found')) {
        errorMsg += 'لم يتم العثور على المحادثة. تأكد من أنك أرسلت رسالة للبوت أولاً.';
      } else if (data.description.includes('Forbidden')) {
        errorMsg += 'البوت ليس لديه صلاحية الإرسال. ابدأ المحادثة مع البوت.';
      } else {
        errorMsg += data.description;
      }
      showAlert(errorMsg, 'error');
    }
  } catch (error) {
    console.error('خطأ في الشبكة:', error);
    showAlert('⚠️ خطأ في الاتصال بالإنترنت أو الخادم، حاول مرة أخرى', 'error');
  } finally {
    isSending = false;
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال';
  }
});
