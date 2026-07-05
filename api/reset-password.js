// استدعاء ملف الـ _db بمسار نسبي صريح متوافق مع Vercel Serverless
const { connectDB, Item } = require('./_db');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

module.exports = async (req, res) => {
    // إعدادات الـ CORS الكاملة لمنع أي تعليق في الفرونت إند
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

        // 2. التحقق من صحة التوكن
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            console.error("JWT Verification Error:", jwtErr);
            return res.status(400).json({ success: false, message: "انتهت صلاحية الرابط أو الرمز غير صالح، اطلب رمزاً جديداً." });
        }

        if (!decoded || !decoded.email) {
            return res.status(400).json({ success: false, message: "الرمز لا يحتوي على بيانات مستخدم صالحة." });
        }

        const userEmail = decoded.email.toLowerCase().trim();

        // 3. تشفير كلمة المرور الجديدة
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // 4. التحديث المباشر والآمن في الموديل المستدعى
        const updatedUser = await Item.findOneAndUpdate(
            { email: userEmail },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "هذا الحساب لم يعد موجوداً في النظام." });
        }

        return res.status(200).json({ success: true, message: "تم تغيير كلمة المرور بنجاح!" });

    } catch (globalError) {
        console.error("Global Server Crash caught:", globalError);
        return res.status(500).json({ success: false, message: `خطأ من السيرفر: ${globalError.message}` });
    }
};