const mongoose = require('mongoose');

// دالة الاتصال بقاعدة البيانات
const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGO_URI);
};

// تعريف هيكل البيانات (Schema)
const ItemSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    name: String,
    category: String
});

// التأكد من عدم إعادة تعريف الـ Model
const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

module.exports = { connectDB, Item };
