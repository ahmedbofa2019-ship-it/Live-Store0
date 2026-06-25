const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).end();
    await connectDB();
    
    const { email, password, role } = req.body;
    
    try {
        const newItem = new Item({ email, password, role });
        await newItem.save();
        res.status(201).json({ success: true, message: "تم التسجيل بنجاح!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "حدث خطأ أثناء التسجيل" });
    }
};
