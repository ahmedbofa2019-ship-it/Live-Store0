const mongoose = require('mongoose');

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGO_URI);
};

const ItemSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true } 
});

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

module.exports = { connectDB, Item };