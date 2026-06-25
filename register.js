const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    // استقبال طلبات من نوع POST فقط
    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    
    try {
        // الاتصال بقاعدة البيانات
        await connectDB();
        
        // استقبال البيانات القادمة من الفرونت أند (الـ Form)
        const { email, password, role } = req.body;
        
        // إنشاء السجل الجديد وحفظه في الـ Database
        const newItem = new Item({ email, password, role });
        await newItem.save();
        
        // إرسال رد النجاح للفرونت أند بصيغة JSON سليمة وبدون أقواس مقلوبة
        return res.status(201).json({ success: true, message: "تم التسجيل بنجاح" });
    } catch (error) {
        console.error(error);
        // إرسال رد بالفشل في حال حدوث أي خطأ في السيرفر أو الاتصال
        return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
    }
};