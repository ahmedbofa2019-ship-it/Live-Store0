// api/reset-password.js
const { connectDB, Item } = require('../_db'); // تأكد من استيراد الموديل الصحيح لمشروعك
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    // التأكد من أن الطلب POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: "طريقة غير مسموحة" });
    }

    try {
        await connectDB();
        const { token, password } = req.body;

        // التحقق من وجود البيانات
        if (!token || !password) {
            return res.status(400).json({ success: false, message: "بيانات ناقصة" });
        }

        // 1. فك تشفير التوكن (تأكد أن JWT_SECRET هو نفسه المستخدم في عملية التحقق)
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, message: "الرابط غير صالح أو منتهي الصلاحية" });
        }
        
        // 2. تشفير كلمة المرور الجديدة
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. تحديث الباسورد في قاعدة البيانات باستخدام البريد الإلكتروني الموجود في التوكن
        const updatedUser = await Item.findOneAndUpdate(
            { email: decoded.email }, 
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
        }

        // 4. إرجاع نجاح العملية
        return res.status(200).json({ 
            success: true, 
            message: "تم تغيير كلمة المرور بنجاح!" 
        });

    } catch (error) {
        console.error("🔥 خطأ في سيرفر تحديث كلمة المرور:", error);
        return res.status(500).json({ 
            success: false, 
            message: "خطأ داخلي في السيرفر، يرجى المحاولة لاحقاً." 
        });
    }
};