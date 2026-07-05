const { connectDB, Item } = require('./_db');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

module.exports = async (req, res) => {
    // تفعيل الـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: "طريقة الطلب غير مسموحة" });
    }

    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: "البيانات المطلوبة ناقصة!" });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "كلمة المرور يجب أن تكون 6 خانات على الأقل" });
        }

        // 1. الاتصال بقاعدة البيانات
        await connectDB();

        // 2. التحقق من صحة التوكن وفك تشفيره
        let decoded;
        try {
            // تأكد تماماً أن JWT_SECRET مضاف في إعدادات Vercel بنفس القيمة المستخدمة عند إنشاء التوكن
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');
        } catch (jwtErr) {
            console.error("JWT Verification Error:", jwtErr);
            return res.status(400).json({ success: false, message: "انتهت صلاحية الجلسة أو الرمز غير صالح، اطلب رمزاً جديداً." });
        }

        // 3. البحث عن المستخدم في الداتابيز باستخدام الإيميل المستخرج من التوكن
        const user = await Item.findOne({ email: decoded.email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ success: false, message: "الحساب غير موجود في النظام." });
        }

        // 4. تشفير كلمة المرور الجديدة باستخدام bcryptjs
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // 5. تحديث كلمة المرور في قاعدة البيانات وحفظها
        user.password = hashedPassword;
        await user.save();

        console.log(`[Success] تم تحديث باسوورد الحساب بنجاح: ${user.email}`);
        return res.status(200).json({ success: true, message: "تم تغيير كلمة المرور بنجاح!" });

    } catch (error) {
        console.error("Reset Password Server Error:", error);
        return res.status(500).json({ success: false, message: "حدث خطأ داخلي في السيرفر." });
    }
};