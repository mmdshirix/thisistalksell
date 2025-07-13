-- Add sample messages for chatbot
INSERT INTO chatbot_messages (chatbot_id, user_message, bot_response, user_ip, user_agent) VALUES
(1, 'سلام، چطور می‌توانم محصولات شما را خریداری کنم؟', 'سلام! شما می‌توانید از طریق فروشگاه آنلاین ما محصولات را مشاهده و خریداری کنید.', '192.168.1.1', 'Mozilla/5.0'),
(1, 'آیا ارسال رایگان دارید؟', 'بله، برای خریدهای بالای 500 هزار تومان ارسال رایگان داریم.', '192.168.1.2', 'Mozilla/5.0'),
(1, 'زمان تحویل سفارش چقدر است؟', 'معمولاً سفارشات در عرض 2 تا 3 روز کاری تحویل داده می‌شود.', '192.168.1.3', 'Mozilla/5.0'),
(1, 'آیا امکان پرداخت در محل وجود دارد؟', 'بله، امکان پرداخت در محل برای شهرهای تهران و کرج وجود دارد.', '192.168.1.1', 'Mozilla/5.0'),
(1, 'شرایط گارانتی محصولات چیست؟', 'تمام محصولات ما دارای 18 ماه گارانتی شرکتی هستند.', '192.168.1.4', 'Mozilla/5.0'),
(1, 'نحوه بازگشت کالا چگونه است؟', 'شما می‌توانید تا 7 روز پس از دریافت، کالا را بازگشت دهید.', '192.168.1.2', 'Mozilla/5.0'),
(1, 'آیا تخفیف ویژه‌ای دارید؟', 'بله، برای مشتریان جدید 10% تخفیف روی اولین خرید داریم.', '192.168.1.5', 'Mozilla/5.0'),
(1, 'چگونه می‌توانم با پشتیبانی تماس بگیرم؟', 'می‌توانید از طریق تلفن 021-88888888 یا همین چت‌بات با ما تماس بگیرید.', '192.168.1.1', 'Mozilla/5.0'),
(1, 'محصولات شما اصل هستند؟', 'بله، تمام محصولات ما اصل و دارای مجوز رسمی هستند.', '192.168.1.6', 'Mozilla/5.0'),
(1, 'آیا شعبه حضوری دارید؟', 'بله، دفتر مرکزی ما در تهران، خیابان ولیعصر قرار دارد.', '192.168.1.3', 'Mozilla/5.0');

-- Add sample tickets
INSERT INTO tickets (chatbot_id, user_ip, subject, message, status, priority) VALUES
(1, '192.168.1.1', 'مشکل در پرداخت', 'سلام، من نمی‌توانم با کارت بانکی خود پرداخت کنم. خطای "تراکنش ناموفق" دریافت می‌کنم. لطفا راهنمایی کنید.', 'open', 'high'),
(1, '192.168.1.2', 'تاخیر در ارسال', 'سفارش من با شماره #12345 از 5 روز پیش ثبت شده ولی هنوز ارسال نشده. کی ارسال می‌شود؟', 'in_progress', 'medium'),
(1, '192.168.1.3', 'درخواست مرجوع کردن کالا', 'محصولی که دریافت کردم مطابق انتظارم نبود. می‌خواهم آن را مرجوع کنم.', 'open', 'low'),
(1, '192.168.1.4', 'سوال درباره گارانتی', 'محصولی که خریداری کردم مشکل دارد. آیا تحت گارانتی است؟', 'closed', 'medium'),
(1, '192.168.1.5', 'درخواست راهنمایی برای خرید', 'سلام، من می‌خواهم لپ‌تاپ بخرم ولی نمی‌دانم کدام مدل مناسب است. راهنمایی کنید.', 'in_progress', 'low'),
(1, '192.168.1.6', 'مشکل در دریافت کد تخفیف', 'کد تخفیف که برایم ارسال شده کار نمی‌کند. لطفا بررسی کنید.', 'open', 'medium');

-- Update timestamps to be more realistic (some today, some yesterday, some this week)
UPDATE chatbot_messages SET timestamp = NOW() - INTERVAL '0 days' WHERE id IN (1, 2);
UPDATE chatbot_messages SET timestamp = NOW() - INTERVAL '1 day' WHERE id IN (3, 4);
UPDATE chatbot_messages SET timestamp = NOW() - INTERVAL '2 days' WHERE id IN (5, 6);
UPDATE chatbot_messages SET timestamp = NOW() - INTERVAL '3 days' WHERE id IN (7, 8);
UPDATE chatbot_messages SET timestamp = NOW() - INTERVAL '4 days' WHERE id IN (9, 10);

UPDATE tickets SET created_at = NOW() - INTERVAL '0 days' WHERE id IN (1, 2);
UPDATE tickets SET created_at = NOW() - INTERVAL '1 day' WHERE id IN (3, 4);
UPDATE tickets SET created_at = NOW() - INTERVAL '2 days' WHERE id IN (5, 6);
