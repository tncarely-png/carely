import { NextResponse } from 'next/server';
import { getCfContext } from '@/lib/cf-context';
import { eq } from 'drizzle-orm';
import { users, subscriptions, orders, licenses, whatsappAgents, products } from '@/db/schema';

// Schema SQL for auto-setup
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY NOT NULL, name text NOT NULL, email text, phone text NOT NULL,
  address text, wilaya text, password text, firebase_uid text,
  role text NOT NULL DEFAULT 'customer', created_at text NOT NULL, updated_at text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users (phone);
CREATE UNIQUE INDEX IF NOT EXISTS users_firebase_uid_unique ON users (firebase_uid);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY NOT NULL, name text NOT NULL, name_ar text NOT NULL, slug text NOT NULL,
  description text, description_ar text, emoji text DEFAULT '📦', image_url text,
  price real NOT NULL DEFAULT 0, currency text DEFAULT 'TND', price_label text,
  features text, landing_sections text, is_active integer DEFAULT 1, sort_order integer DEFAULT 0,
  route text, external_url text, created_at text NOT NULL, updated_at text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON products (slug);

CREATE TABLE IF NOT EXISTS licenses (
  id text PRIMARY KEY NOT NULL, qustodio_email text NOT NULL, qustodio_password text NOT NULL,
  plan text NOT NULL DEFAULT 'silver', is_assigned integer DEFAULT 0, assigned_to_user text,
  assigned_at text, expires_at text, purchased_from text, notes text,
  created_at text NOT NULL, updated_at text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS licenses_qustodio_email_unique ON licenses (qustodio_email);

CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY NOT NULL, user_id text NOT NULL REFERENCES users (id),
  plan text NOT NULL DEFAULT 'silver', status text NOT NULL DEFAULT 'pending',
  qustodio_email text, qustodio_password text, activation_code text,
  devices_count integer DEFAULT 5, starts_at text, expires_at text,
  auto_renew integer DEFAULT 0, notes text, license_id text REFERENCES licenses (id),
  created_at text NOT NULL, updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY NOT NULL, user_id text NOT NULL REFERENCES users (id),
  subscription_id text REFERENCES subscriptions (id), plan text NOT NULL DEFAULT 'silver',
  amount_tnd real NOT NULL DEFAULT 0, payment_method text DEFAULT 'flouci',
  payment_ref text, receipt_url text, status text NOT NULL DEFAULT 'pending',
  paid_at text, created_at text NOT NULL, updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS whatsapp_agents (
  id text PRIMARY KEY NOT NULL, name text NOT NULL, phone text NOT NULL,
  gender text, is_active integer DEFAULT 0, title text, emoji text
);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY NOT NULL, value text NOT NULL,
  created_at text NOT NULL, updated_at text NOT NULL
);
`;

// GET /api/seed — seed database with demo data
export async function GET() {
  try {
    const { db } = getCfContext();

    // Auto-create tables if they don't exist
    const statements = SCHEMA_SQL.split(";").map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    for (const stmt of statements) {
      try { await db.run(stmt); } catch { /* ignore already exists */ }
    }

    // Migration: add columns that might be missing from existing tables
    const MIGRATIONS = [
      "ALTER TABLE products ADD COLUMN landing_sections text",
    ];
    for (const migration of MIGRATIONS) {
      try { await db.run(migration); } catch { /* column already exists */ }
    }

    // Check if admin already exists
    const existingAdmin = await db.select().from(users)
      .where(eq(users.phone, '+216 22 000 001'))
      .get();

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Database already seeded',
      });
    }

    const now = new Date().toISOString();
    const adminId = crypto.randomUUID();

    // Create admin user
    await db.insert(users).values({
      id: adminId,
      name: 'أدمن كيرلي',
      phone: '+216 22 000 001',
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    });

    // Create 5 demo customers
    const customerData = [
      {
        id: crypto.randomUUID(),
        name: 'أحمد بن علي',
        phone: '+216 22 123 456',
        address: 'شارع الحبيب بورقيبة',
        wilaya: 'تونس',
        role: 'customer',
      },
      {
        id: crypto.randomUUID(),
        name: 'سارة المنصوري',
        phone: '+216 55 987 654',
        address: 'نهج الحرية',
        wilaya: 'صفاقس',
        role: 'customer',
      },
      {
        id: crypto.randomUUID(),
        name: 'يوسف الحداد',
        phone: '+216 90 111 222',
        address: 'شارع محمد الخامس',
        wilaya: 'سوسة',
        role: 'customer',
      },
      {
        id: crypto.randomUUID(),
        name: 'نور الهدى التريكي',
        phone: '+216 23 456 789',
        address: 'نهج الاستقلال',
        wilaya: 'المنستير',
        role: 'customer',
      },
      {
        id: crypto.randomUUID(),
        name: 'محمد الكافي',
        phone: '+216 52 333 444',
        address: 'شارع 9 أفريل',
        wilaya: 'قفصة',
        role: 'customer',
      },
    ];

    await db.insert(users).values(
      customerData.map(c => ({
        ...c,
        createdAt: now,
        updatedAt: now,
      }))
    );

    // Create products
    await db.insert(products).values([
      {
        id: crypto.randomUUID(),
        name: 'Qustodio',
        nameAr: 'كوستوديو',
        slug: 'qustodio',
        description: 'Parental control & digital wellbeing for families',
        descriptionAr: 'حماية أطفالك على النت — تحكم أبوي كامل',
        emoji: '🛡️',
        imageUrl: null,
        price: 89,
        currency: 'TND',
        priceLabel: 'من 89 دت / سنة',
        features: JSON.stringify([
          'حجب المواقع غير اللائقة',
          'تحديد وقت الشاشة',
          'تقارير أسبوعية',
          'دعم فني بالتونسي',
          'تفعيل فوري بعد الدفع',
        ]),
        landingSections: JSON.stringify([
          {
            type: 'hero',
            emoji: '🛡️',
            title: 'Qustodio',
            subtitle: 'أفضل تطبيق حماية أطفال في العالم',
            description: 'حجب المواقع، مراقبة الشاشة، تتبع الموقع، وتقارير يومية — كلو من هاتفك',
            price: 89,
            priceLabel: 'من 89 دت / سنة',
            ctaText: 'اشتري الآن',
          },
          {
            type: 'features',
            title: 'كل اللي تحتاجيه تحمي عيلتك',
            items: [
              { icon: '🛡️', text: 'حجب المواقع غير اللائقة تلقائياً' },
              { icon: '⏰', text: 'تحديد وقت الشاشة اليومي' },
              { icon: '📱', text: 'مراقبة واتساب وانستغرام' },
              { icon: '📍', text: 'تتبع الموقع الجغرافي' },
              { icon: '📊', text: 'تقارير يومية مفصلة' },
              { icon: '📞', text: 'حجب مكالمات وجهات اتصال' },
              { icon: '🔍', text: 'مراقبة يوتيوب ومرشّحات البحث' },
              { icon: '🎮', text: 'تحكم في التطبيقات والألعاب' },
            ],
          },
          {
            type: 'how-it-works',
            title: 'كيف تشتغل؟',
            steps: [
              { icon: '1️⃣', title: 'اختار الباقة', text: 'Silver أو Gold حسب عدد الأجهزة' },
              { icon: '2️⃣', title: 'ادفع بسهولة', text: 'Flouci، حوالة بنكية، أو CCP' },
              { icon: '3️⃣', title: 'نفعّلك الحساب', text: 'خلال 30 دقيقة على الواتساب' },
              { icon: '4️⃣', title: 'استمتع بالحماية', text: 'ركّب على أجهزة الأولاد وهدو بالك' },
            ],
          },
          {
            type: 'trust-badges',
            items: [
              { icon: '⚡', text: 'تفعيل فوري' },
              { icon: '🛡️', text: 'ضمان 7 أيام' },
              { icon: '💬', text: 'دعم بالتونسي' },
              { icon: '🇹🇳', text: 'من تونس' },
            ],
          },
          {
            type: 'cta',
            title: 'ابدأ حماية عيلتك اليوم 🛡️',
            subtitle: 'أكثر من 500 عيلة تونسية تثق بـ Carely.tn',
            ctaText: 'اشتري الآن',
            ctaSubtext: 'تواصل معانا',
          },
        ]),
        isActive: true,
        sortOrder: 1,
        route: 'qustodio-app',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        name: 'Coming Soon',
        nameAr: 'قريبًا...',
        slug: 'coming-soon',
        description: 'New app coming soon',
        descriptionAr: 'تطبيق جديد — ابقو معانا 👀',
        emoji: '🔜',
        imageUrl: null,
        price: 0,
        currency: 'TND',
        priceLabel: '',
        features: JSON.stringify([]),
        isActive: true,
        sortOrder: 99,
        route: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed landing page settings
    await db.insert(products).values; // not needed, we seed settings separately

    // Create default landing page content settings
    const defaultSettings = [
      { key: 'hero_title', value: 'متجر Carely.tn 🛍️' },
      { key: 'hero_subtitle', value: 'حسابات تطبيقات العيلة المدفوعة' },
      { key: 'hero_description', value: 'اشتري، فعّل، واستمتع — مع دعم مباشر على الواتساب' },
      { key: 'hero_subdescription', value: 'من ولاية الكاف، نخدمو كامل تونس 🇹🇳' },
      { key: 'cta_primary_text', value: 'شوف تطبيقاتنا' },
      { key: 'cta_secondary_text', value: 'تواصل معانا' },
      { key: 'store_name', value: 'Carely.tn' },
      { key: 'store_tagline', value: 'متجر التطبيقات المدفوعة للعيلة التونسية' },
      { key: 'whatsapp_number', value: '21626107128' },
      { key: 'contact_email', value: 'contact@carely.tn' },
      { key: 'silver_price', value: '89' },
      { key: 'gold_price', value: '149' },
    ];

    // Create settings table entries via raw SQL to avoid drizzle issues
    for (const s of defaultSettings) {
      try {
        await db.run(
          `INSERT OR IGNORE INTO settings (key, value, created_at, updated_at) VALUES (?, ?, ?, ?)`,
          [s.key, s.value, now, now]
        );
      } catch {
        // ignore duplicates
      }
    }

    // Create 3 available licenses
    const licenseData = [
      {
        id: crypto.randomUUID(),
        qustodioEmail: 'license-silver-1@carely.tn',
        qustodioPassword: 'LicPass$1',
        plan: 'silver',
        isAssigned: false,
        purchasedFrom: 'Qustodio Direct',
        notes: 'Silver license — available',
      },
      {
        id: crypto.randomUUID(),
        qustodioEmail: 'license-silver-2@carely.tn',
        qustodioPassword: 'LicPass$2',
        plan: 'silver',
        isAssigned: false,
        purchasedFrom: 'Qustodio Direct',
        notes: 'Silver license — available',
      },
      {
        id: crypto.randomUUID(),
        qustodioEmail: 'license-gold-1@carely.tn',
        qustodioPassword: 'LicPass$3',
        plan: 'gold',
        isAssigned: false,
        purchasedFrom: 'Reseller',
        notes: 'Gold license — available',
      },
    ];

    await db.insert(licenses).values(
      licenseData.map(l => ({
        ...l,
        createdAt: now,
        updatedAt: now,
      }))
    );

    // Create subscriptions
    const sub1Id = crypto.randomUUID();
    const sub2Id = crypto.randomUUID();
    const sub3Id = crypto.randomUUID();
    const sub4Id = crypto.randomUUID();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const fourHundredDaysAgo = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    const threeHundredThirtyFiveDaysFromNow = new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString();
    const threeHundredFiveDaysFromNow = new Date(Date.now() + 305 * 24 * 60 * 60 * 1000).toISOString();

    await db.insert(subscriptions).values([
      {
        id: sub1Id,
        userId: customerData[0].id,
        plan: 'silver',
        status: 'active',
        qustodioEmail: 'ahmed-qustodio@carely.tn',
        qustodioPassword: 'QusAhmed$1',
        devicesCount: 5,
        startsAt: thirtyDaysAgo,
        expiresAt: threeHundredThirtyFiveDaysFromNow,
        autoRenew: true,
        createdAt: thirtyDaysAgo,
        updatedAt: now,
      },
      {
        id: sub2Id,
        userId: customerData[1].id,
        plan: 'gold',
        status: 'active',
        qustodioEmail: 'sara-qustodio@carely.tn',
        qustodioPassword: 'QusSara$1',
        devicesCount: 10,
        startsAt: sixtyDaysAgo,
        expiresAt: threeHundredFiveDaysFromNow,
        autoRenew: true,
        createdAt: sixtyDaysAgo,
        updatedAt: now,
      },
      {
        id: sub3Id,
        userId: customerData[2].id,
        plan: 'silver',
        status: 'expired',
        qustodioEmail: 'youssef-qustodio@carely.tn',
        qustodioPassword: 'QusYous$1',
        devicesCount: 5,
        startsAt: fourHundredDaysAgo,
        expiresAt: thirtyFiveDaysAgo,
        autoRenew: false,
        createdAt: fourHundredDaysAgo,
        updatedAt: now,
      },
      {
        id: sub4Id,
        userId: customerData[3].id,
        plan: 'gold',
        status: 'pending',
        devicesCount: 10,
        autoRenew: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Create orders
    await db.insert(orders).values([
      {
        id: crypto.randomUUID(),
        userId: customerData[0].id,
        subscriptionId: sub1Id,
        plan: 'silver',
        amountTnd: 89,
        paymentMethod: 'flouci',
        paymentRef: 'FL-001234',
        status: 'paid',
        paidAt: thirtyDaysAgo,
        createdAt: thirtyDaysAgo,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        userId: customerData[1].id,
        subscriptionId: sub2Id,
        plan: 'gold',
        amountTnd: 149,
        paymentMethod: 'flouci',
        paymentRef: 'FL-ABCXYZ',
        status: 'paid',
        paidAt: sixtyDaysAgo,
        createdAt: sixtyDaysAgo,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        userId: customerData[2].id,
        subscriptionId: sub3Id,
        plan: 'silver',
        amountTnd: 89,
        paymentMethod: 'ccp',
        status: 'paid',
        paidAt: fourHundredDaysAgo,
        createdAt: fourHundredDaysAgo,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        userId: customerData[3].id,
        subscriptionId: sub4Id,
        plan: 'gold',
        amountTnd: 149,
        paymentMethod: 'flouci',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        userId: customerData[4].id,
        plan: 'silver',
        amountTnd: 89,
        paymentMethod: 'virement',
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Create default WhatsApp agents
    await db.insert(whatsappAgents).values([
      {
        id: crypto.randomUUID(),
        name: 'Maram',
        phone: '+21652013035',
        gender: 'female',
        isActive: true,
        title: 'الوكيلة الأولى',
        emoji: '👩',
      },
      {
        id: crypto.randomUUID(),
        name: 'Chafik',
        phone: '+21650496159',
        gender: 'male',
        isActive: false,
        title: 'الوكيل الثاني',
        emoji: '👨',
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        adminId,
        adminPhone: '+216 22 000 001',
        customerIds: customerData.map(c => c.id),
      },
    });
  } catch (error) {
    console.error('GET /api/seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
