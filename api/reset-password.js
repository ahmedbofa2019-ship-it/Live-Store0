const { connectDB, Item } = require('./_db');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

module.exports = async (req, res) => {
    // إعدادات الـ CORS الكاملة
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

        // 2. فك التوكن والتحقق منه
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            console.error("JWT Error:", jwtErr);
            return res.status(400).json({ success: false, message: "انتهت صلاحية الرابط أو الرمز غير صالح." });
        }

        if (!decoded || !decoded.email) {
            return res.status(400).json({ success: false, message: "الرمز لا يحتوي على بيانات مستخدم صالحة." });
        }

        const userEmail = decoded.email.toLowerCase().trim();

        // 3. تشفير الباسورد الجديد
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // 4. التحديث في الداتابيز بطريقة آمنة ومباشرة تمنع الـ Crash
        const updatedUser = await Item.findOneAndUpdate(
            { email: userEmail },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "هذا الحساب لم يعد موجوداً في النظام." });
        }

        // لو وصلنا هنا يبقى كله تمام والتعديل سمع في المونجو
        return res.status(200).json({ success: true, message: "تم تغيير كلمة المرور بنجاح!" });

    } catch (globalError) {
        console.error("Global Crash:", globalError);
        return res.status(500).json({ success: false, message: `خطأ داخلي في السيرفر: ${globalError.message}` });
    }
};