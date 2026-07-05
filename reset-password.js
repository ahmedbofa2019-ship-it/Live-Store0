document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetForm');
    const msg = document.getElementById('message');
    const token = new URLSearchParams(window.location.search).get('token');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            msg.innerText = "كلمتا المرور غير متطابقتين!";
            msg.style.color = "#ff6b6b";
            return;
        }

        msg.innerText = "جاري الحفظ...";
        msg.style.color = "#d4af37";

        try {
            // تأكد من أن المسار هنا هو نفس اسم ملف الـ API داخل مجلد api
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const text = await res.text(); // استقبال الرد كنص أولاً
            
            try {
                const data = JSON.parse(text); // محاولة تحويله لـ JSON
                if (res.ok) {
                    msg.innerText = data.message || "تم تغيير كلمة المرور!";
                    msg.style.color = "#2ecc71";
                } else {
                    msg.innerText = data.message || "حدث خطأ من السيرفر";
                    msg.style.color = "#ff6b6b";
                }
            } catch (e) {
                // هنا لو الرد ليس JSON (أي صفحة خطأ HTML)
                console.error("Server Error Response:", text);
                msg.innerText = "خطأ: السيرفر لا يستجيب كـ API. تأكد من أن ملف reset-password.js موجود داخل مجلد api.";
                msg.style.color = "#ff6b6b";
            }
        } catch (err) {
            msg.innerText = "فشل الاتصال بالسيرفر";
            msg.style.color = "#ff6b6b";
        }
    });
});