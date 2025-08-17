# 🤖 پلتفرم چت‌بات هوشمند

پلتفرم جامع ساخت و مدیریت چت‌بات‌های هوشمند با قابلیت تعبیه در وب‌سایت‌ها

[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Neon](https://img.shields.io/badge/Database-Neon-green?style=for-the-badge)](https://neon.tech)

## 📋 فهرست مطالب

- [ویژگی‌ها](#ویژگی‌ها)
- [تکنولوژی‌های استفاده شده](#تکنولوژی‌های-استفاده-شده)
- [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
- [متغیرهای محیطی](#متغیرهای-محیطی)
- [دیپلوی روی لیارا](#دیپلوی-روی-لیارا)
- [استفاده](#استفاده)
- [API مستندات](#api-مستندات)

## ✨ ویژگی‌ها

- 🎯 **ساخت چت‌بات آسان**: رابط کاربری ساده برای ایجاد چت‌بات‌های هوشمند
- 🔧 **پنل مدیریت کامل**: مدیریت چت‌بات‌ها، پیام‌ها، و آمار
- 📊 **آنالیتیکس پیشرفته**: نمودارها و گزارش‌های تفصیلی
- 🎨 **طراحی ریسپانسیو**: سازگار با تمام دستگاه‌ها
- 🌐 **تعبیه در وب‌سایت**: کد آماده برای نصب روی سایت‌ها
- 🔐 **احراز هویت امن**: سیستم ورود محافظت شده
- 📱 **پشتیبانی از فارسی**: فونت وزیر و راست‌چین
- 🚀 **عملکرد بالا**: بهینه‌سازی شده برای سرعت

## 🛠 تکنولوژی‌های استفاده شده

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI Components
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Server-side Logic
- **Neon Database** - PostgreSQL Serverless
- **bcryptjs** - Password Hashing

### DevOps
- **Docker** - Containerization
- **Liara** - Deployment Platform
- **GitHub** - Version Control

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+
- npm یا yarn
- حساب Neon Database

### مراحل نصب

1. **کلون کردن پروژه**
\`\`\`bash
git clone https://github.com/your-username/chatbot-platform.git
cd chatbot-platform
\`\`\`

2. **نصب وابستگی‌ها**
\`\`\`bash
npm install
\`\`\`

3. **تنظیم متغیرهای محیطی**
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. **راه‌اندازی دیتابیس**
- حساب Neon ایجاد کنید
- DATABASE_URL را در .env.local قرار دهید
- دیتابیس را مقداردهی اولیه کنید:
\`\`\`bash
curl -X POST http://localhost:3000/api/database/init
\`\`\`

5. **اجرای پروژه**
\`\`\`bash
npm run dev
\`\`\`

پروژه روی `http://localhost:3000` در دسترس خواهد بود.

## 🔧 متغیرهای محیطی

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: DeepSeek AI Integration
DEEPSEEK_API_KEY="your-deepseek-api-key"
\`\`\`

## 🐳 دیپلوی روی لیارا

### با Docker

1. **ایجاد فایل liara.json**
\`\`\`json
{
  "image": "node:20-alpine",
  "port": 3000,
  "app": "your-app-name",
  "build": {
    "dockerfile": true
  }
}
\`\`\`

2. **دیپلوی**
\`\`\`bash
# نصب Liara CLI
npm install -g @liara/cli

# ورود به حساب
liara login

# دیپلوی
liara deploy
\`\`\`

### تنظیمات لیارا
- در پنل لیارا، متغیر `DATABASE_URL` را تنظیم کنید
- پورت 3000 را فعال کنید
- SSL را فعال کنید

## 📖 استفاده

### ورود به سیستم
- رمز عبور پیش‌فرض: `Mmd38163816@S#iri`
- برای تغییر رمز، فایل `app/page.tsx` را ویرایش کنید

### ساخت چت‌بات جدید
1. روی "ایجاد چت‌بات جدید" کلیک کنید
2. نام و پیام خوش‌آمدگویی را وارد کنید
3. چت‌بات ایجاد می‌شود و کد تعبیه در دسترس قرار می‌گیرد

### تعبیه در وب‌سایت
\`\`\`html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/widget/CHATBOT_ID';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
\`\`\`

## 📚 API مستندات

### چت‌بات‌ها
- `GET /api/chatbots` - دریافت لیست چت‌بات‌ها
- `POST /api/chatbots` - ایجاد چت‌بات جدید
- `GET /api/chatbots/[id]` - دریافت اطلاعات چت‌بات
- `PUT /api/chatbots/[id]` - بروزرسانی چت‌بات
- `DELETE /api/chatbots/[id]` - حذف چت‌بات

### پیام‌ها
- `GET /api/messages` - دریافت پیام‌ها
- `POST /api/chat` - ارسال پیام به چت‌بات

### دیتابیس
- `GET /api/database/test` - تست اتصال دیتابیس
- `POST /api/database/init` - مقداردهی اولیه دیتابیس

## 🤝 مشارکت

1. Fork کنید
2. برنچ جدید ایجاد کنید (`git checkout -b feature/amazing-feature`)
3. تغییرات را commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request ایجاد کنید

## 📄 مجوز

این پروژه تحت مجوز MIT منتشر شده است.

## 🆘 پشتیبانی

اگر مشکلی داشتید:
1. [Issues](https://github.com/your-username/chatbot-platform/issues) را بررسی کنید
2. Issue جدید ایجاد کنید
3. یا با ما تماس بگیرید

---

**ساخته شده با ❤️ توسط [v0.dev](https://v0.dev)**
