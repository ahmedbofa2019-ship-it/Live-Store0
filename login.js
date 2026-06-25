const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    // استقبال طلبات من نوع POST فقط
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    try {
        // الاتصال بقاعدة البيانات
        await connectDB();

        // استقبال بيانات تسجيل الدخول من الفرونت أند
        const { email, password } = req.body;

        // البحث عن المستخدم بالإيميل والباسورد
        // (ملاحظة: بما أننا نخزن البيانات في موديل Item، نبحث جواه)
        const user = await Item.findOne({ email, password });

        if (!user) {
            // إذا لم يتم العثور على الحساب، نرسل خطأ
            return res.status(401).json({ success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        // إذا كانت البيانات صحيحة، نرسل رد بالنجاح مع بيانات الحساب والـ role
        return res.status(200).json({ 
            success: true, 
            message: "تم تسجيل الدخول بنجاح",
            user: {
                email: user.email,
                role: user.role,
                name: user.name || ""
            }
        });

    } catch (error) {
        console.error(error);
        // إرسال رد بالفشل في حال حدوث أي خطأ في السيرفر
        return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
    }
};