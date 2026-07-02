const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { userOtp, otpToken } = req.body;

        if (!userOtp || !otpToken) {
            return res.status(400).json({ success: false, message: 'بيانات التحقق غير مكتملة، يرجى إعادة المحاولة من صفحة نسيت كلمة المرور.' });
        }

        // فك تشفير التوكن والتحقق من صلاحيته
        let decoded;
        try {
            decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, message: 'انتهت صلاحية الرمز (5 دقائق)، يرجى طلب رمز جديد.' });
        }

        // 🌟 المطابقة بالملي مع الاسم اللي في ملف الفورجيت (decoded.otpCode)
        if (decoded.otpCode !== userOtp.trim()) {
            return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح، تأكد من الرمز المرسل لإيميلك.' });
        }

        // لو الرمز صح، بنرجع نجاح
        return res.status(200).json({ 
            success: true, 
            message: 'تم التحقق من الرمز بنجاح.' 
        });

    } catch (error) {
        console.error("🔥 خطأ في سيرفر التحقق من الـ OTP:", error);
        return res.status(500).json({ success: false, message: 'خطأ داخلي في السيرفر' });
    }
};