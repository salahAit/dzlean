# 📘 الوثيقة التقنية التأسيسية: مشروع "أفدنا" (الجيل الثاني)

**التاريخ:** 10 ديسمبر 2025  
**الإصدار:** 2.0 (Bun Migration)  
**الهدف:** بناء منصة تعليمية فائقة الأداء، اقتصادية، ومستقلة تقنياً.

---

## 1. الفلسفة المعمارية: "المونوليث المدمج" (Compact Monolith)

بدلاً من تعقيدات الخدمات المصغرة (Microservices) أو فصل الواجهة عن الخلفية (Headless)، سنعتمد هيكلية **"الوحدة الواحدة المدمجة"**.

| المبدأ       | التفصيل                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| **الوحدة**   | التطبيق يعمل كوحدة واحدة (Frontend + Backend) داخل إطار عمل SvelteKit     |
| **المحرك**   | الاعتماد الكلي على بيئة Bun Runtime لاستغلال السرعة وكفاءة الذاكرة        |
| **البيانات** | التخلي عن خوادم قواعد البيانات المنفصلة (PostgreSQL) لصالح SQLite المدمجة |

---

## 2. مكدس التكنولوجيا (The Tech Stack)

| المكون        | التقنية المختارة   | السبب التقني الحاسم                                             |
| ------------- | ------------------ | --------------------------------------------------------------- |
| **Runtime**   | Bun (v1.1+)        | أسرع بـ 3 أضعاف من Node.js، أدوات مدمجة (Bundler, Test, SQLite) |
| **Framework** | SvelteKit          | يوحد لغة البرمجة (TypeScript) ويلغي الحاجة لطبقة API وسيطة      |
| **Database**  | SQLite (Native)    | استخدام `bun:sqlite` للاستفادة القصوى من سرعة الـ I/O           |
| **ORM**       | Drizzle ORM        | أخف مكتبة ORM، تدعم TypeScript بالكامل                          |
| **Auth**      | Native Custom Auth | نظام مصادقة محلي يعتمد على الجلسات في SQLite                    |
| **Proxy**     | Caddy              | خادم ويب لإدارة HTTPS تلقائياً وتوجيه الترافيك                  |

---

## 3. استراتيجية البيانات: "الفصل الذكي" (Dual-Database Strategy)

لحل مشكلة "تحديث المحتوى دون فقدان بيانات الطلاب"، سنفصل النظام إلى قاعدتي بيانات مستقلتين:

### أ. قاعدة بيانات المحتوى (`content.db`) - 🟢 Read-Only

| الخاصية         | التفصيل                                                   |
| --------------- | --------------------------------------------------------- |
| **المحتوى**     | الدروس، المسارات، النصوص المفرغة، روابط الفيديو، الفهارس  |
| **دورة الحياة** | يتم توليدها "أوفلاين" على جهازك المحلي، ثم ترفع كملف واحد |
| **التحديث**     | يتم استبدال الملف بالكامل عند وجود دروس جديدة             |

### ب. قاعدة بيانات المستخدمين (`users.db`) - 🔴 Read-Write

| الخاصية             | التفصيل                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| **المحتوى**         | جدول المستخدمين (User)، الجلسات (Session)، سجل التقدم (LessonProgress) |
| **الأداء**          | تفعيل وضع WAL Mode للقراءة والكتابة المتزامنة                          |
| **النسخ الاحتياطي** | هذا الملف الوحيد الذي يحتاج نسخ احتياطي دوري                           |

```sql
-- تفعيل WAL Mode
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
```

---

## 4. المنطق البيداغو-تقني (Business Logic)

### قاعدة "الـ 10 دقائق" (The 10-Minute Rule)

لحماية السيرفر من ضغط الكتابة غير الضروري، وفرض الجدية على الطلاب:

| المرحلة                | التفصيل                                                         |
| ---------------------- | --------------------------------------------------------------- |
| **فلترة الواجهة**      | المتصفح لا يرسل طلب تحديث إلا بعد 600 ثانية من المشاهدة الفعلية |
| **الفيديوهات القصيرة** | أقل من 10 دقائق = طلب تحديث واحد عند النهاية (`on:ended`)       |
| **تقنية UPSERT**       | أمر SQL واحد لحفظ التقدم، يوفر 50% من الاستعلامات               |

```sql
-- UPSERT للتقدم
INSERT INTO lesson_progress (user_id, lesson_id, watched_seconds, updated_at)
VALUES (?, ?, ?, datetime('now'))
ON CONFLICT(user_id, lesson_id) DO UPDATE SET
    watched_seconds = excluded.watched_seconds,
    updated_at = excluded.updated_at;
```

### شرط الاكتمال (Completion Criteria)

الدرس لا يعتبر "مكتملاً" ✅ إلا بتحقق الشرطين:

```typescript
const isCompleted = lesson.video_completed && lesson.quiz_passed;
```

---

## 5. نظام المصادقة (Authentication)

تم التخلي عن المكتبات الخارجية لصالح نظام محلي "مضاد للزمن":

| المكون      | التقنية                                            |
| ----------- | -------------------------------------------------- |
| **التشفير** | `Bun.password.hash()` و `verify()` - مدمج وسريع    |
| **الجلسات** | تخزين `session_id` في جدول `sessions`              |
| **الكوكيز** | `HttpOnly`, `Secure`, `SameSite=Lax` عبر SvelteKit |

```typescript
// مثال على التشفير
const hash = await Bun.password.hash(password, {
	algorithm: 'argon2id',
	memoryCost: 4,
	timeCost: 3
});

const isValid = await Bun.password.verify(password, hash);
```

### تنظيف الجلسات المنتهية

```sql
-- تشغيل يومياً عبر cron
DELETE FROM sessions WHERE expires_at < datetime('now');
```

---

## 6. البنية التحتية (Infrastructure)

### السيرفر

- **المزود:** Contabo VPS
- **المواصفات:** 12 vCPU, 48GB RAM, NVMe

### مخطط النشر (Deployment Diagram)

```
┌─────────────────────────────────────────────────────────┐
│                      Internet                           │
└─────────────────────────┬───────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│           Caddy Web Server                              │
│           (Reverse Proxy + Auto SSL)                    │
└─────────────────────────┬───────────────────────────────┘
                          ▼ Port 3000
┌─────────────────────────────────────────────────────────┐
│           Bun Runtime (SvelteKit App)                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Frontend (Svelte 5 + Shadcn-Svelte)            │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Backend (/api routes)                          │    │
│  └─────────────────────────────────────────────────┘    │
│           │                    │                        │
│           ▼                    ▼                        │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │  users.db       │  │  content.db     │               │
│  │  (WAL - R/W)    │  │  (Read-Only)    │               │
│  └─────────────────┘  └─────────────────┘               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (Future)
┌─────────────────────────────────────────────────────────┐
│           Cloudflare R2 (PDF, Images)                   │
└─────────────────────────────────────────────────────────┘
```

### إدارة العمليات (systemd)

```ini
# /etc/systemd/system/afidna.service
[Unit]
Description=Afidna Educational Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/afidna
ExecStart=/usr/local/bin/bun run build/index.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### النسخ الاحتياطي

```bash
#!/bin/bash
# /etc/cron.daily/backup-afidna

BACKUP_DIR="/backup/afidna"
DATE=$(date +%Y%m%d_%H%M)

# نسخ users.db
sqlite3 /var/www/afidna/data/users.db ".backup ${BACKUP_DIR}/users_${DATE}.db"

# حذف النسخ الأقدم من 7 أيام
find ${BACKUP_DIR} -name "*.db" -mtime +7 -delete
```

---

## 7. الأمان (Security)

| الطبقة            | الحماية                                 |
| ----------------- | --------------------------------------- |
| **Transport**     | HTTPS إجباري عبر Caddy                  |
| **Cookies**       | `HttpOnly`, `Secure`, `SameSite=Lax`    |
| **Passwords**     | Argon2id عبر `Bun.password`             |
| **SQL**           | استخدام Prepared Statements عبر Drizzle |
| **Rate Limiting** | حماية `/api/auth/*` من brute force      |

```typescript
// Rate limiting middleware (hooks.server.ts)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
```

---

## 8. خارطة التنفيذ (Implementation Roadmap)

### المرحلة 0: التأسيس (Setup) ⏱️ 2-3 ساعات

- [ ] `bun init` + SvelteKit
- [ ] تكوين Drizzle للاتصال بملفين (`users.db`, `content.db`)
- [ ] إعداد هيكل المجلدات

### المرحلة 1: نواة النظام (Core) ⏱️ 4-5 ساعات

- [ ] بناء نظام المصادقة المحلي (`auth.ts`)
- [ ] بناء Schema المستخدمين والجلسات
- [ ] إعداد middleware للحماية

### المرحلة 2: المحتوى (Content) ⏱️ 3-4 ساعات

- [ ] برمجة سكربت الترحيل (Migration Script)
- [ ] بناء واجهة عرض الدروس
- [ ] ربط المسارات والدروس

### المرحلة 3: التفاعل (Progress Logic) ⏱️ 4-5 ساعات

- [ ] برمجة مشغل الفيديو الذكي (Svelte Component)
- [ ] تنفيذ منطق الـ 10 دقائق
- [ ] نظام الأسئلة والاختبارات

### المرحلة 4: النشر (Deploy) ⏱️ 2-3 ساعات

- [ ] إعداد السيرفر وتشغيل Caddy
- [ ] تكوين systemd
- [ ] إعداد النسخ الاحتياطي والمراقبة

---

## 9. هيكل المجلدات المقترح

```
afidna/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   ├── users.ts      # اتصال users.db
│   │   │   │   ├── content.ts    # اتصال content.db
│   │   │   │   └── schema.ts     # Drizzle schemas
│   │   │   ├── auth.ts           # نظام المصادقة
│   │   │   └── utils.ts
│   │   └── components/
│   │       ├── VideoPlayer.svelte
│   │       ├── QuizCard.svelte
│   │       └── ProgressTracker.svelte
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/+server.ts
│   │   │   │   ├── register/+server.ts
│   │   │   │   └── logout/+server.ts
│   │   │   └── progress/+server.ts
│   │   ├── tracks/
│   │   ├── lessons/
│   │   └── dashboard/
│   └── hooks.server.ts           # Auth middleware
├── data/
│   ├── users.db                  # إنتاج
│   └── content.db                # إنتاج
├── drizzle/
│   └── migrations/
├── static/
├── ARCHITECTURE.md
├── package.json
└── drizzle.config.ts
```

---

## 10. المراجع والأدوات

| الأداة        | الرابط                         |
| ------------- | ------------------------------ |
| Bun           | https://bun.sh                 |
| SvelteKit     | https://kit.svelte.dev         |
| Drizzle ORM   | https://orm.drizzle.team       |
| Shadcn-Svelte | https://next.shadcn-svelte.com |
| Caddy         | https://caddyserver.com        |

---

> **آخر تحديث:** 10 ديسمبر 2025  
> **المؤلف:** فريق أفدنا  
> **الحالة:** ✅ مُصادق عليه للتنفيذ
