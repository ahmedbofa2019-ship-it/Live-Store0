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

        // 2. خط الدفاع للباك أند: التحقق من صيغة الإيميل بالشروط العالمية
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "البريد الإلكتروني غير صالح ومطابق للشروط" });
        }

        // 3. خط الدفاع للباك أند: التحقق من طول كلمة المرور (أقل من 6)
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "يجب أن لا تقل كلمة المرور عن 6 حروف وارقام" });
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

        return res.status(201).json({ success: true, message: "تم التسجيل بنجاح", data: newItem });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
    }
};