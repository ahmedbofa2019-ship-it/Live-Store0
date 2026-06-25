const mongoose = require('mongoose');

// ربط الداتا بيز
const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGO_URI);
};

// تعريف هيكل البيانات (Schema)
const ItemSchema = new mongoose.Schema({
    name: String,
    category: String
});

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

module.exports = { connectDB, Item };
