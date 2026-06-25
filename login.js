const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).end();
    await connectDB();
    
    const { email, password } = req.body;
    
    try {
        const user = await Item.findOne({ email, password });
        if (user) {
            res.status(200).json({ success: true, role: user.role });
        } else {
            res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "خطأ في السيرفر" });
    }
};
