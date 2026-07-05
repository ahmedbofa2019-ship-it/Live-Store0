document.addEventListener('DOMContentLoaded', () => {
    // 1. محاولة استخراج التوكن من الرابط تلقائياً
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const form = document.getElementById('resetForm');
    const msg = document.getElementById('message');
    const saveBtn = document.getElementById('saveBtn');

    // تأكيد فتح الأزرار والفورم تماماً عند البداية لتجنب أي رسائل حمراء فورية
    if (saveBtn) saveBtn.disabled = false;

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // التحقق من تطابق الباسورد
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

            // [التعديل الاحترافي]: التحقق من وجود التوكن فقط عند محاولة الحفظ
            if (!token) {
                msg.style.color = "#ff6b6b";
                msg.innerText = "⚠️ انتهت صلاحية الجلسة أو الرابط غير صالح. يرجى إعادة طلب رابط جديد من صفحة نسيت كلمة المرور.";
                return;
            }

            // إعداد الواجهة لإرسال الطلب
            saveBtn.disabled = true;
            msg.style.color = "#d4af37";
            msg.innerText = "جاري حفظ التغييرات...";

            try {
                // إرسال الطلب إلى السيرفر الخاص بك على Vercel
                const res = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token, password })
                });

                const responseText = await res.text();
                let data;
                
                try {
                    data = JSON.parse(responseText);
                } catch(e) {
                    msg.style.color = "#ff6b6b";
                    msg.innerText = "السيرفر واجه مشكلة داخلية (500). راجع الـ Logs في Vercel.";
                    saveBtn.disabled = false;
                    return;
                }

                if (res.ok && data.success) {
                    msg.style.color = "#2ecc71";
                    msg.innerText = data.message || "تم تغيير كلمة المرور بنجاح!";
                    form.style.display = "none"; // إخفاء الفورم عند النجاح
                } else {
                    msg.style.color = "#ff6b6b";
                    msg.innerText = data.message || "فشل في تعيين كلمة المرور الجديدة.";
                    saveBtn.disabled = false;
                }

            } catch (error) {
                console.error("Fetch Error:", error);
                msg.style.color = "#ff6b6b";
                msg.innerText = "حدث خطأ في الاتصال بالشبكة، تحقق من اتصالك وحاول مجدداً.";
                saveBtn.disabled = false;
            }
        });
    }
});