const { connectDB, Item } = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    // التأكد أن الطلب POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: "الطريقة غير مسموح بها" });
    }

    try {
        // الاتصال بقاعدة البيانات
        await connectDB();

        const { email, password, role } = req.body;

        // 1. التأكد من وجود البيانات الأساسية
        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: "برجاء، إدخال البيانات كاملة" });
        }

        // 2. التحقق من صيغة الإيميل
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "البريد الإلكتروني غير صالح" });
        }

        // 3. التحقق من طول كلمة المرور
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "يجب أن لا تقل كلمة المرور عن 6 حروف وارقام" });
        }

        // تشفير الباسورد
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // حفظ الحساب
        const newItem = new Item({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || 'customer'
        });

        await newItem.save();

        return res.status(201).json({ success: true, message: "تم التسجيل بنجاح" });

    } catch (error) {
        // 🌟 التعديل الاحترافي هنا:
        // كود 11000 في MongoDB يعني Duplicate Key (تكرار إيميل)
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "هذا البريد الإلكتروني مسجل بالفعل، يرجى كتابة ايميل اخر." 
            });
        }

        console.error("Registration Error:", error);
        return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر أثناء التسجيل" });
    }
};