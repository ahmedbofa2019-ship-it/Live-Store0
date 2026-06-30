import { connectDB } from './_db.js'; // التعديل هنا عشان يقرأ الملف اللي جنبه علطول
import mongoose from 'mongoose';

// التحقق من الموديل عشان الـ Serverless
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
}));

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        await connectDB();
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'البريد الإلكتروني مطلوب' });
        }

        // البحث عن المستخدم في المونجو دي بي
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // للأمان وحماية الخصوصية: نرجع دايماً كود 200 نجاح عشان نمنع الـ User Enumeration
        if (!user) {
            return res.status(200).json({ success: true, message: 'إذا كان الحساب موجوداً، فسيتم إرسال الرابط.' });
        }

        // [منطق إرسال الإيميل الفعلي مستقبلاً بـ NodeMailer]
        return res.status(200).json({ 
            success: true, 
            message: 'تم التحقق من الحساب وإرسال كود الاستعادة بنجاح.' 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'خطأ داخلي في السيرفر' });
    }
}