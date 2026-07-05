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

        // 2. التحقق من صحة التوكن وفك تشفيره بشكل آمن
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SECRET_KEY');
        } catch (jwtErr) {
            console.error("JWT Verification Error:", jwtErr);
            return res.status(400).json({ success: false, message: "انتهت صلاحية الجلسة أو الرمز غير صالح، اطلب رمزاً جديداً." });
        }

        // التأكد من أن التوكن تم فكه بنجاح ويحتوي على البريد الإلكتروني
        if (!decoded || !decoded.email) {
            return res.status(400).json({ success: false, message: "الرمز غير صالح أو لا يحتوي على بيانات مستخدم." });
        }

        const userEmail = decoded.email.toLowerCase().trim();

        // 3. تشفير كلمة المرور الجديدة
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // 4. تحديث كلمة المرور مباشرة في قاعدة البيانات والتحقق من وجود الحساب
        const updatedUser = await Item.findOneAndUpdate(
            { email: userEmail },
            { $set: { password: hashedPassword } },
            { new: true } // ليعيد المستند بعد التحديث
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "الحساب المرتبط بهذا الرمز غير موجود في النظام." });
        }

        console.log(`[Success] تم تحديث كلمة المرور بنجاح للحساب: ${userEmail}`);
        return res.status(200).json({ success: true, message: "تم تغيير كلمة المرور بنجاح!" });

    } catch (error) {
        console.error("Reset Password Server Error:", error);
        return res.status(500).json({ success: false, message: "حدث خطأ داخلي في السيرفر." });
    }
};