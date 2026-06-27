const { connectDB, Item } = require('./_db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectDB();
        const { email, password } = req.body;

        // 1. طباعة البيانات القادمة من الفرونت أند للتأكد منها
        console.log("=== لمحاولة تسجيل الدخول ===");
        console.log("الإيميل المطلوب:", email);
        console.log("الباسورد المطلوب:", password);

        if (!email || !password) {
            return res.status(400).json({ message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
        }

        // البحث في الموديل
        const user = await Item.findOne({ email: email.toLowerCase().trim() });

        // 2. طباعة نتيجة البحث في الداتا بيز
        if (!user) {
            console.log("❌ نتيجة البحث: لم يتم العثور على هذا الإيميل في الداتا بيز أصلاً!");
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        console.log("✅ نتيجة البحث: تم العثور على المستخدم بنجاح.");
        console.log("الباسورد المشفر المخزن في الداتا بيز هو:", user.password);

        // مقارنة الباسورد
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        // 3. طباعة نتيجة المقارنة
        console.log("هل الباسورد متطابق مع التشفير؟", isPasswordValid);

        if (!isPasswordValid) {
            console.log("❌ نتيجة المقارنة: الباسورد المكتوب مش متوافق مع المتشفر!");
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        console.log("🎉 نجاح: الباسورد متطابق تماماً وجاري الدخول!");
        return res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح!',
            user: {
                id: user._id,
                email: user.email,
                role: user.role || 'customer'
            }
        });

    } catch (error) {
        console.error("🔥 خطأ داخل السيرفر:", error);
        return res.status(500).json({ message: 'حدث خطأ في السيرفر أثناء تسجيل الدخول' });
    }
};