const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).end();
    
    await connectDB();
    const { name, category } = req.body;
    
    try {
        await Item.create({ name, category });
        res.status(201).json({ success: true, message: "تمت إضافة المحل بنجاح" });
    } catch (error) {
        res.status(500).json({ success: false, message: "فشل الحفظ" });
    }
};