document.addEventListener('DOMContentLoaded', () => {
    // 1. استخراج التوكن تلقائياً من رابط الصفحة (URL)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const form = document.getElementById('resetForm');
    const msg = document.getElementById('message');
    const saveBtn = document.getElementById('saveBtn');

    // إذا فتح الصفحة بدون توكن في الرابط نبهه فوراً وعطل زرار الحفظ
    if (!token) {
        if (msg) {
            msg.style.color = "#ff6b6b";
            msg.innerText = "⚠️ خطأ: الرابط لا يحتوي على رمز التحقق (token). يرجى الضغط على الرابط المرسل إلى بريدك الإلكتروني بالكامل.";
        }
        if (saveBtn) saveBtn.disabled = true;
    }

    // 2. معالجة إرسال الفورم عند الضغط على زر الحفظ
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // التحقق من تطابق الباسورد في الفرونت إند أولاً
            if (password !== confirmPassword) {
                msg.style.color = "#ff6b6b";
                msg.innerText = "كلمتا المرور غير متطابقتين!";
                return;
            }

            if (password.length < 6) {
                msg.style.color = "#ff6b6b";
                msg.innerText = "يجب ألا تقل كلمة المرور عن 6 أحرف.";
                return;
            }

            // تجهيز الواجهة وقفل الزرار لمنع التكرار
            if (saveBtn) saveBtn.disabled = true;
            msg.style.color = "#d4af37";
            msg.innerText = "جاري حفظ التغييرات...";

            try {
                // إرسال الطلب للـ API الخاص بك على Vercel
                const res = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token, password })
                });

                // قراءة الرد كـ نص أولاً لضمان عدم حدوث كراش لو السيرفر وقع ورجع HTML
                const responseText = await res.text();
                let data;
                
                try {
                    data = JSON.parse(responseText);
                } catch(e) {
                    msg.style.color = "#ff6b6b";
                    msg.innerText = "السيرفر واجه مشكلة داخلية (500). راجع الـ Logs في Vercel.";
                    if (saveBtn) saveBtn.disabled = false;
                    return;
                }

                if (res.ok && data.success) {
                    msg.style.color = "#2ecc71";
                    msg.innerText = data.message || "تم تغيير كلمة المرور بنجاح!";
                    form.style.display = "none"; // إخفاء الفورم بعد النجاح
                } else {
                    msg.style.color = "#ff6b6b";
                    msg.innerText = data.message || "فشل في تعيين كلمة المرور الجديدة.";
                    if (saveBtn) saveBtn.disabled = false;
                }

            } catch (error) {
                console.error("Fetch Error:", error);
                msg.style.color = "#ff6b6b";
                msg.innerText = "حدث خطأ في الاتصال بالشبكة، تحقق من اتصالك وحاول مجدداً.";
                if (saveBtn) saveBtn.disabled = false;
            }
        });
    }
});