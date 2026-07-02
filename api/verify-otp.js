const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    // التأكد أن الطلب POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { userOtp, otpToken } = req.body;

        if (!userOtp || !otpToken) {
            return res.status(400).json({ success: false, message: 'البيانات المرسلة غير مكتملة' });
        }

        // 🔐 فك تشفير الـ Token ومطابقته بالـ JWT_SECRET المتسيف في لوحة التحكم
        // الـ jwt بيتحقق تلقائياً إذا كانت الـ 5 دقائق مخلصتش
        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

        // مقارنة الرمز اللي كتبه المستخدم بالرمز الحقيقي اللي كان متشفر جوه التوكن
        if (decoded.otpCode === userOtp.trim()) {
            return res.status(200).json({ 
                success: true, 
                message: 'الرمز صحيح! جاري تحويلك لتعيين كلمة المرور الجديدة.' 
            });
        } else {
            return res.status(400).json({ success: false, message: 'الرمز الذي أدخلته غير صحيح' });
        }

    } catch (error) {
        // لو الـ 5 دقائق خلصوا أو التوكن ملعوب فيه، الـ jwt هيضرب خطأ هنا علطول
        console.error("🔥 خطأ أثناء فك تشفير الـ OTP:", error);
        return res.status(400).json({ 
            success: false, 
            message: 'انتهت صلاحية الرمز أو أنه غير صالح، يرجى إعادة المحاولة من جديد.' 
        });
    }
};