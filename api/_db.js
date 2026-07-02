const mongoose = require('mongoose');

// دالة الاتصال بقاعدة البيانات
const connectDB = async () => {
    // إذا كان هناك اتصال قائم بالفعل، لا تقم بإنشاء اتصال جديد
    if (mongoose.connections[0].readyState) return;
    
    // الاتصال باستخدام المتغير المتصل بـ Vercel
    await mongoose.connect(process.env.MONGO_URI);
};

// تعريف هيكل البيانات (Schema) للمستخدمين والعناصر
const ItemSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true, // 🌟 يمنع وجود مستخدمين بنفس الإيميل
        lowercase: true, // يحفظ الإيميل دائماً بحروف صغيرة
        trim: true // يزيل أي مسافات فارغة بالخطأ
    },
    password: { type: String, required: true },
    role: { type: String, required: true },
    name: String,
    category: String
});

// التأكد من عدم إعادة تعريف الـ Model إذا كان موجوداً بالفعل
const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

// تصدير الدالة والموديل لاستخدامهم في باقي الملفات
module.exports = { connectDB, Item };