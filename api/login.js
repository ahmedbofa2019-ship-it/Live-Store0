const mongoose = require('mongoose');

// 1. تعريف الـ Schema بتاعتك مباشرة هنا عشان الـ Serverless يفهمها بسرعة وميحصلش أخطاء مسارات
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'owner'], required: true }
});

// منع إعادة تعريف الموديل في بيئة الـ Serverless
const User = mongoose.models.User || mongoose.model('User', UserSchema);

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }
    const dbUri = process.env.DB_URI; 
    if (!dbUri) {
        throw new Error('خطأ: لم يتم العثور على متغير البيئة DB_URI في فيرسيل');
    }
    cachedDb = await mongoose.connect(dbUri);
    return cachedDb;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'الطريقة غير مسموح بها' });
    }

    try {
        // الاتصال بقاعدة البيانات الحية في السحاب
        await connectToDatabase();

        const { email, password } = req.body;

        // 🔍 البحث في قاعدة البيانات الحية باستخدام الـ Schema بتاعتك بالظبط
        const user = await User.findOne({ email: email });

        // لو الحساب مش موجود في مونجو أطلس
        if (!user) {
            return res.status(401).json({ success: false, message: "هذا الحساب غير مسجل لدينا" });
        }

        // التحقق من صحة الباسورد (مقارنة الباسورد المكتوب باللي في القاعدة)
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "كلمة المرور غير صحيحة" });
        }

        // لو كل حاجة تمام، السيرفر هيرد بنجاح ويرجع بياناته والدور بتاعه (owner أو customer)
        return res.status(200).json({
            success: true,
            message: "تم تسجيل الدخول بنجاح!",
            user: {
                email: user.email,
                role: user.role // هيرجعلك سواء كان owner أو customer
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'حدث خطأ في السيرفر أو الاتصال بالقاعدة' });
    }
};