module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { email, password } = req.body;
    
    // حالياً بنعمل تشيك بسيط، بعدين نربطه بالداتا بيز
    if (email && password) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
};
