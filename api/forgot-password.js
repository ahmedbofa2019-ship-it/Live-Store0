const { connectDB, Item } = require('./_db');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    // التأكد أن الطلب POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        // الاتصال بقاعدة البيانات
        await connectDB();
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'البريد الإلكتروني مطلوب' });
        }

        const cleanEmail = email.toLowerCase().trim();

        // البحث في موديل Item
        const user = await Item.findOne({ email: cleanEmail });

        // التعديل هنا: إذا لم يوجد المستخدم، نرجع خطأ صريح (404) ليظهر في صفحة الواجهة
        if (!user) {
            return res.status(404).json({ success: false, message: 'هذا البريد الإلكتروني غير مسجل لدينا.' });
        }

        // 🌟 توليد رمز عشوائي مكوّن من 6 أرقام
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 🔐 عمل الـ Token المشفر والمؤقت (ينتهي بعد 5 دقائق)
        const otpToken = jwt.sign({ email: cleanEmail, otpCode }, process.env.JWT_SECRET, { expiresIn: '5m' });

        // ⚙️ إعداد السيرفر المسؤول عن إرسال الإيميلات (Gmail)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            }
        });

        // ✉️ تحديد تفاصيل الإيميل
        const mailOptions = {
            from: `"Live Store" <${process.env.EMAIL_USER}>`,
            to: cleanEmail,
            subject: 'رمز إعادة تعيين كلمة المرور - Live Store',
            html: `
                <div style="direction: rtl; text-align: right; font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #d4af37; border-radius: 8px; background-color: #1a1a1a; color: #ffffff;">
                    <h2 style="color: #d4af37; text-align: center;">Live Store</h2>
                    <p>أهلاً بك،</p>
                    <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. يرجى استخدام الرمز السري التالي لإتمام العملية:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; padding: 10px 30px; background-color: #262626; border: 1px solid #d4af37; color: #d4af37; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 4px;">
                            ${otpCode}
                        </span>
                    </div>
                    <p style="color: #aaa; font-size: 12px;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا الإيميل بأمان.</p>
                </div>
            `
        };

        // إرسال الإيميل
        await transporter.sendMail(mailOptions);

        // إرجاع النتيجة للمتصفح
        return res.status(200).json({ 
            success: true, 
            message: 'تم إرسال كود الاستعادة إلى بريدك الإلكتروني.',
            otpToken 
        });

    } catch (error) {
        console.error("🔥 خطأ في سيرفر استعادة كلمة المرور:", error);
        return res.status(500).json({ success: false, message: 'خطأ داخلي في السيرفر، يرجى المحاولة لاحقاً.' });
    }
};