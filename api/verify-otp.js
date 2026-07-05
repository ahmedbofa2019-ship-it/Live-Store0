const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    // التأكد أن الطلب POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { userOtp, otpToken } = req.body;

        // التحقق من وجود البيانات
        if (!userOtp || !otpToken) {
            return res.status(400).json({ 
                success: false, 
                message: 'بيانات التحقق غير مكتملة، يرجى إعادة المحاولة من صفحة نسيت كلمة المرور.' 
            });
        }

        // فك تشفير التوكن والتحقق من صلاحيته
        let decoded;
        try {
            decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ 
                success: false, 
                message: 'انتهت صلاحية الرمز (5 دقائق)، يرجى طلب رمز جديد.' 
            });
        }

        // مطابقة كود الـ OTP
        if (decoded.otpCode !== userOtp.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'رمز التحقق غير صحيح، تأكد من الرمز المرسل لإيميلك.' 
            });
        }

        // 🌟 توليد توكن جديد (Reset Token) صالح لمدة 15 دقيقة فقط
        // يُستخدم هذا التوكن لاحقاً في صفحة reset-password للتحقق من هوية المستخدم
        const resetToken = jwt.sign(
            { email: decoded.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );

        // العودة بالنجاح مع إرسال الـ resetToken
        return res.status(200).json({ 
            success: true, 
            message: 'تم التحقق من الرمز بنجاح.',
            resetToken 
        });

    } catch (error) {
        console.error("🔥 خطأ في سيرفر التحقق من الـ OTP:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'خطأ داخلي في السيرفر، يرجى المحاولة لاحقاً.' 
        });
    }
};