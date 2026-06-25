const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    // استقبال طلبات POST فقط
    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    
    try {
        // الاتصال بقاعدة البيانات
        await connectDB();
        
        // استقبال البيانات القادمة من الفرونت أند
        const { email, password, role } = req.body;
        
        // إنشاء الحساب وحفظه
        const newItem = new Item({ email, password, role });
        await newItem.save();
        
        // رد بالنجاح
        return res.status(201).json({ success: true, message: "تم التسجيل بنجاح" });
    } catch (error) {
        console.error(error);
        // رد بالفشل في حال حدوث خطأ بالسيرفر
        return res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
    }
}