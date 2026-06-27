import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs'; // رجعنا للمكتبة المستقرة جافا سكريبت بنسبة 100% لتجنب كراش السيرفر

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
        
        // ربطنا هنا بقاعدة البيانات "test" والكوليكشن "users" بالملّي حسب صورتك
        const database = client.db('test'); 
        const usersCollection = database.collection('users');

        // البحث عن المستخدم بالإيميل
        const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // مقارنة الباسورد باستخدام bcryptjs الآمنة في الـ Serverless
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // لو كل حاجة صحيحة
        return res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح!',
            user: {
                id: user._id,
                email: user.email,
                role: user.role || 'customer'
            }
        });

    } catch (error) {
        console.error("Login Server Error:", error);
        return res.status(500).json({ message: 'حدثت مشكلة داخلية في السيرفر أثناء تسجيل الدخول' });
    } finally {
        if (client) {
            await client.close();
        }
    }
}