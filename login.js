import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs'; // مهم جداً عشان يقدر يقرا الباسورد المتشفر اللي في الداتا بيز

const uri = process.env.MONGO_URI;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
    }

    let client;

    try {
        client = new MongoClient(uri);
        await client.connect();
        
        const database = client.db('LiveStore');
        const usersCollection = database.collection('users');

        // البحث عن المستخدم بالإيميل (وتحويله لحروف صغيرة لضمان الدقة)
        const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // مقارنة الباسورد المكتوب بالباسورد المشفر القادم من الداتا بيز باستخدام bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // لو البيانات صحيحة
        return res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح!',
            user: {
                id: user._id,
                email: user.email,
                role: user.role || 'customer'
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: 'حدثت مشكلة في السيرفر أثناء تسجيل الدخول' });
    } finally {
        if (client) {
            await client.close();
        }
    }
}