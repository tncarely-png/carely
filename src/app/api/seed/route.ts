import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/seed — seed database with demo data
export async function GET() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@carely.tn' },
    });
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Database already seeded',
      });
    }

    // Create admin user
    const admin = await db.user.create({
      data: {
        name: 'أدمن كيرلي',
        email: 'admin@carely.tn',
        password: 'admin123',
        role: 'admin',
      },
    });

    // Create 5 demo customers
    const customers = await Promise.all([
      db.user.create({
        data: {
          name: 'أحمد بن علي',
          email: 'ahmed@example.com',
          password: 'customer123',
          phone: '+216 22 123 456',
          address: 'شارع الحبيب بورقيبة',
          wilaya: 'تونس',
          role: 'customer',
        },
      }),
      db.user.create({
        data: {
          name: 'سارة المنصوري',
          email: 'sara@example.com',
          password: 'customer123',
          phone: '+216 55 987 654',
          address: 'نهج الحرية',
          wilaya: 'صفاقس',
          role: 'customer',
        },
      }),
      db.user.create({
        data: {
          name: 'يوسف الحداد',
          email: 'youssef@example.com',
          password: 'customer123',
          phone: '+216 90 111 222',
          address: 'شارع محمد الخامس',
          wilaya: 'سوسة',
          role: 'customer',
        },
      }),
      db.user.create({
        data: {
          name: 'نور الهدى التريكي',
          email: 'nour@example.com',
          password: 'customer123',
          phone: '+216 23 456 789',
          address: 'نهج الاستقلال',
          wilaya: 'المنستير',
          role: 'customer',
        },
      }),
      db.user.create({
        data: {
          name: 'محمد الكافي',
          email: 'mohamed.k@example.com',
          password: 'customer123',
          phone: '+216 52 333 444',
          address: 'شارع 9 أفريل',
          wilaya: 'قفصة',
          role: 'customer',
        },
      }),
    ]);

    // Create 3 available licenses
    const licenses = await Promise.all([
      db.license.create({
        data: {
          qustodioEmail: 'license-silver-1@carely.tn',
          qustodioPassword: 'LicPass$1',
          plan: 'silver',
          isAssigned: false,
          purchasedFrom: 'Qustodio Direct',
          notes: 'Silver license — available',
        },
      }),
      db.license.create({
        data: {
          qustodioEmail: 'license-silver-2@carely.tn',
          qustodioPassword: 'LicPass$2',
          plan: 'silver',
          isAssigned: false,
          purchasedFrom: 'Qustodio Direct',
          notes: 'Silver license — available',
        },
      }),
      db.license.create({
        data: {
          qustodioEmail: 'license-gold-1@carely.tn',
          qustodioPassword: 'LicPass$3',
          plan: 'gold',
          isAssigned: false,
          purchasedFrom: 'Reseller',
          notes: 'Gold license — available',
        },
      }),
    ]);

    // Create subscriptions for customers
    const now = new Date();
    const sub1 = await db.subscription.create({
      data: {
        userId: customers[0].id,
        plan: 'silver',
        status: 'active',
        qustodioEmail: 'ahmed-qustodio@carely.tn',
        qustodioPassword: 'QusAhmed$1',
        devicesCount: 5,
        startsAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
        autoRenew: true,
      },
    });

    const sub2 = await db.subscription.create({
      data: {
        userId: customers[1].id,
        plan: 'gold',
        status: 'active',
        qustodioEmail: 'sara-qustodio@carely.tn',
        qustodioPassword: 'QusSara$1',
        devicesCount: 10,
        startsAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 305 * 24 * 60 * 60 * 1000),
        autoRenew: true,
      },
    });

    const sub3 = await db.subscription.create({
      data: {
        userId: customers[2].id,
        plan: 'silver',
        status: 'expired',
        qustodioEmail: 'youssef-qustodio@carely.tn',
        qustodioPassword: 'QusYous$1',
        devicesCount: 5,
        startsAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        autoRenew: false,
      },
    });

    const sub4 = await db.subscription.create({
      data: {
        userId: customers[3].id,
        plan: 'gold',
        status: 'pending',
        devicesCount: 10,
        autoRenew: false,
      },
    });

    // Create orders
    await Promise.all([
      db.order.create({
        data: {
          userId: customers[0].id,
          subscriptionId: sub1.id,
          plan: 'silver',
          amountTnd: 89,
          paymentMethod: 'card',
          paymentRef: 'CARD-001234',
          status: 'paid',
          paidAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      }),
      db.order.create({
        data: {
          userId: customers[1].id,
          subscriptionId: sub2.id,
          plan: 'gold',
          amountTnd: 149,
          paymentMethod: 'flouci',
          paymentRef: 'FL-ABCXYZ',
          status: 'paid',
          paidAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        },
      }),
      db.order.create({
        data: {
          userId: customers[2].id,
          subscriptionId: sub3.id,
          plan: 'silver',
          amountTnd: 89,
          paymentMethod: 'cash',
          status: 'paid',
          paidAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        },
      }),
      db.order.create({
        data: {
          userId: customers[3].id,
          subscriptionId: sub4.id,
          plan: 'gold',
          amountTnd: 149,
          paymentMethod: 'd17',
          status: 'pending',
        },
      }),
      db.order.create({
        data: {
          userId: customers[4].id,
          plan: 'silver',
          amountTnd: 89,
          paymentMethod: 'transfer',
          status: 'pending',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        adminId: admin.id,
        customerIds: customers.map((c) => c.id),
        licenseIds: licenses.map((l) => l.id),
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
