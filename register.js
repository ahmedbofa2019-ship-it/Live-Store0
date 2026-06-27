const { connectDB, Item } = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    
    try {
        await connectDB();
        const { email, password, role } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "برجاء إدخال البيانات كاملة" });
        }

        // تشفير الباسورد يدوياً قبل الحفظ
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // حفظ الحساب بالباسورد المشفر الجديد
        const newItem = new Item({ 
            email: email.toLowerCase().trim(), 
            password: hashedPassword, 
            role: role || 'customer'
        });
        
        await newItem.save();
        return res.status(201).json({ success: true, message: "تم التسجيل بنجاح" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
    }
};