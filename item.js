const { connectDB, Item } = require('./_db');

module.exports = async (req, res) => {
    await connectDB();
    const { category } = req.query;
    
    try {
        const items = await Item.find({ category: category });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json([]);
    }
};
