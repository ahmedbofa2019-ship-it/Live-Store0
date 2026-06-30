const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    try {
        // الاتصال بقاعدة البيانات
        await connectDB();

        // 1. جلب البيانات وعرضها لو الطلب GET
        if (req.method === 'GET') {
            const items = await Item.find({});
            return res.status(200).json({ success: true, data: items });
        }

        // 2. إضافة بيانات جديدة من الباك أند لو الطلب POST
        if (req.method === 'POST') {
            const { email, password, role, name, category } = req.body;

            // التأكد من وجود البيانات الأساسية
            if (!email || !password || !role) {
                return res.status(400).json({ success: false, message: "البيانات الأساسية ناقصة" });
            }

            // 🌟 التعديل الجديد: التأكد من صيغة الإيميل بالشروط العالمية
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: "البريد الإلكتروني غير صالح ومطابق للشروط" });
            }

            // 🌟 التعديل الجديد: التأكد من طول كلمة المرور (أقل من 6)
            if (password.length < 6) {
                return res.status(400).json({ success: false, message: "يجب أن لا تقل كلمة المرور عن 6 حروف وارقام" });
            }

            // لو البيانات سليمة، يتم الحفظ في الداتا بيز
            const newItem = new Item({ email, password, role, name, category });
            await newItem.save();

            return res.status(201).json({ success: true, message: "تمت إضافة العنصر بنجاح", data: newItem });
        }

        // لو نوع الطلب مش GET ولا POST
        return res.status(405).end();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
    }
};