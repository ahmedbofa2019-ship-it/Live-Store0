// api/reset-password.js
const { connectDB, User } = require('../_db'); // تأكد من استيراد الموديل الصحيح لمستخدميك
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ message: "طريقة غير مسموحة" });

    try {
        await connectDB();
        const { token, password } = req.body;

        // 1. فك تشفير التوكن (تأكد أن JWT_SECRET هو نفسه المستخدم في إرسال البريد)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 2. تشفير كلمة المرور الجديدة
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. تحديث الباسورد في قاعدة البيانات
        await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

        return res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح!" });

    } catch (error) {
        return res.status(400).json({ success: false, message: "الرابط غير صالح أو منتهي الصلاحية" });
    }
};