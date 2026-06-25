const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    // التأكد من أن الطلب من نوع POST
    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    
    try {
        // الاتصال بقاعدة البيانات
        await connectDB();
        
        // استقبال البيانات من الفورم
        const { email, password, role } = req.body;
        
        // إنشاء حساب جديد وحفظه
        const newItem = new Item({ email, password, role });
        await newItem.save();
        
        // إرسال رد النجاح
        return res.status(201).json({ success: true, message: "تم التسجيل بنجاح" });
    } catch (error) {
        console.error(error);
        // إرسال رد الخطأ في حالة حدوث مشكلة بالسيرفر
        return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
    }
};

