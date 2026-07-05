const { connectDB, Item } = require('./_db');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: "Method not allowed" });

    try {
        const { token, password } = req.body;
        if (!token) return res.status(400).json({ success: false, message: "الرابط غير صالح (لا يوجد رمز تحقق)" });

        await connectDB();
        
        // التحقق من التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(password, salt);

        await Item.findOneAndUpdate({ email: decoded.email }, { password: hash });

        return res.status(200).json({ success: true, message: "تم تغيير كلمة المرور بنجاح!" });
    } catch (err) {
        return res.status(400).json({ success: false, message: "فشل التوثيق: الرمز غير صالح أو انتهت صلاحيته" });
    }
};