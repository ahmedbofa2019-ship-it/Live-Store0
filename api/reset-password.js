const { connectDB, Item } = require('./_db');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

module.exports = async (req, res) => {
    // 1. تأكيد الرد كـ JSON دائماً
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    try {
        await connectDB();
        const { token, password } = req.body;

        if (!token) throw new Error("التوكن مفقود");
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(password, salt);

        const updated = await Item.findOneAndUpdate({ email: decoded.email }, { password: hash });
        
        if (!updated) throw new Error("المستخدم غير موجود");

        return res.status(200).json({ success: true, message: "تم تغيير كلمة المرور بنجاح!" });
    } catch (err) {
        // [هنا السحر]: أي خطأ هيحصل، السيرفر هيرد بـ JSON فيه اسم الخطأ بالظبط
        return res.status(500).json({ 
            success: false, 
            message: "Server Error: " + err.message 
        });
    }
};