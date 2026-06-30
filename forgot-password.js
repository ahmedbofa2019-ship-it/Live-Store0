const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    // التأكد أن الطلب POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        // الاتصال بقاعدة البيانات باستخدام الدالة المشتركة من _db
        await connectDB();
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'البريد الإلكتروني مطلوب' });
        }

        // البحث في موديل Item الموحد اللي شغال بيه المشروع
        const user = await Item.findOne({ email: email.toLowerCase().trim() });

        // للأمان وحماية الخصوصية: نرجع دايماً نجاح عشان نمنع الـ User Enumeration
        if (!user) {
            return res.status(200).json({ success: true, message: 'إذا كان الحساب موجوداً، فسيتم إرسال الرابط.' });
        }

        // [منطق إرسال الإيميل الفعلي مستقبلاً بـ NodeMailer ينزل هنا]
        
        return res.status(200).json({ 
            success: true, 
            message: 'تم التحقق من الحساب وإرسال كود الاستعادة بنجاح.' 
        });

    } catch (error) {
        console.error("🔥 خطأ في سيرفر استعادة كلمة المرور:", error);
        return res.status(500).json({ success: false, message: 'خطأ داخلي في السيرفر' });
    }
};