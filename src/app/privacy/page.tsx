import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "سياسة الخصوصية — Carely.tn",
  description: "سياسة الخصوصية لمنصة Carely.tn — كيف نحمي بياناتك الشخصية ونستعملها.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b-2 border-carely-green">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-0">
              <span className="text-2xl font-extrabold text-carely-green">Carely</span>
              <span className="text-2xl font-bold text-carely-gray">.tn</span>
            </Link>
            <Link
              href="/"
              className="carely-btn-outline text-sm px-4 py-2 rounded-full"
            >
              الرئيسية
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-carely-dark mb-3">
                سياسة الخصوصية
              </h1>
              <p className="text-carely-gray text-sm">
                آخر تحديث: 1 يناير 2025
              </p>
            </div>

            <div className="carely-card p-6 md:p-8 space-y-8 text-carely-gray leading-relaxed" dir="rtl">
              {/* Intro */}
              <div>
                <p className="text-base leading-loose">
                  أهلا بيك في <span className="font-bold text-carely-dark">Carely.tn</span>. نحنا نحترم خصوصيتك ونبغو نوضحلك كيفاش نستخدم المعلومات الشخصية بتاعك. هذي السياسة تشرح كل المعلومات اللي نجمّعوها، كيفاش نستعملوها، والحقوق اللي عندك.
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">1</span>
                  المعلومات اللي نجمّعوها
                </h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">رقم الهاتف:</strong> نحتاجوه باش نبعثلك كود التفعيل (OTP) ونفعّل حسابك. هاد الرقم هو وسيلة الدخول الوحية لحسابك.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">الاسم:</strong> الاسم الكامل اللي تدخلوه عند التسجيل.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">العنوان والولاية:</strong> معلومات التوصيل (اختيارية).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">معلومات الدفع:</strong> طريقة الدفع اللي اختاريتها ورقم المرجع (ما نحفظوش بيانات كارت بنكي).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">بيانات الاستخدام:</strong> نجمّعو معلومات تقنية بحال نوع المتصفح وآلة التشغيل باش نحسّنو التجربة.</span>
                  </li>
                </ul>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">2</span>
                  كيفاش نستعملو المعلومات
                </h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span>تفعيل وإدارة حسابك وإشتراكاتك في Carely.tn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span>معالجة الطلبات وتوصيل الخدمات المشتراة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span>إرسال إشعارات مهمة بحال حالة الطلب وتجديد الاشتراك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span>تقديم الدعم الفني والرد على استفساراتك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span>تحسين خدماتنا وتجربة المستخدم</span>
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">3</span>
                  مشاركة المعلومات مع الغير
                </h2>
                <p className="text-sm mb-3">
                  نحنا <strong className="text-carely-dark">ما نبيعوش و ما نشاركوش</strong> معلوماتك الشخصية مع أي طرف ثالث إلا في الحالات التالية:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">Qustodio:</strong> نشارك معلومات الاشتراك (بريد Qustodio وكلمة السر) معك فقط باش تستعمل خدمة الحماية.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">مقدمي خدمات الدفع:</strong> نشارك البيانات اللازمة فقط مع مزود الدفع اللي اختارته (Flouci, D17, كارت بنكي).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">القانون:</strong> إذا طلب منا القانون التونسي أو أي سلطة قضائية نشارك معلومات ضرورية.</span>
                  </li>
                </ul>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">4</span>
                  حماية البيانات
                </h2>
                <p className="text-sm">
                  نستعملو إجراءات أمنية مناسبة باش نحمي معلوماتك الشخصية من الوصول غير المصرح به والتعديل والإفشاء والتلف. الدخول لحسابك يكون فقط برمز OTP يوصلك على هاتفك — ما عندكش كلمة سر محفوظة عندنا. مع ذلك، ما فيش طريقة حماية 100% على الإنترنت، فنحمّلك المسؤولية على الحفاظ على سرية هاتفك وكود التفعيل.
                </p>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">5</span>
                  ملفات الكوكيز (Cookies)
                </h2>
                <p className="text-sm">
                  نستعملو ملفات كوكيز أساسية فقط باش نحافظو على تفضيلاتك ونجعلو التصفح أحسن. ما نستعملوش كوكيز تتبع خارجية ولا نشاركو بيانات الكوكيز مع أي طرف ثالث.
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">6</span>
                  حقوقك
                </h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">الوصول:</strong> تقدر تشوف وتعدّل المعلومات الشخصية بتاعك من صفحة حسابي.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">الحذف:</strong> تقدر تطلب حذف حسابك وكل المعلومات المتعلقة بيك بالتواصل معانا.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-carely-green mt-0.5">●</span>
                    <span><strong className="text-carely-dark">الاعتراض:</strong> تقدر تعترض على معالجة معلوماتك لأغراض تسويقية.</span>
                  </li>
                </ul>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">7</span>
                  الاحتفاظ بالبيانات
                </h2>
                <p className="text-sm">
                  نحتفظو بمعلوماتك الشخصية ما دام حسابك نشط أو ما دام ضروري باش نقدملك الخدمات. إذا حذفت حسابك، نحذفو كل المعلومات الشخصية بتاعك في غضون 30 يوم، إلا إذا طلب منا القانون الاحتفاظ بيها.
                </p>
              </div>

              {/* Section 8 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">8</span>
                  تحديث سياسة الخصوصية
                </h2>
                <p className="text-sm">
                  تقدر نحدّث هذي السياسة من وقت لآخر. إذا عدّلنا شيء مهم، نبلغك عبر الإشعارات في التطبيق أو عبر رسالة على هاتفك. آخر تحديث كان في 1 يناير 2025.
                </p>
              </div>

              {/* Section 9 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">9</span>
                  تواصل معانا
                </h2>
                <p className="text-sm mb-3">
                  إذا عندك أي سؤال على سياسة الخصوصية أو على كيفاش نتعامل مع البيانات، تواصل معانا:
                </p>
                <div className="bg-carely-mint rounded-xl p-4 space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-carely-dark">📧</span>
                    <a href="mailto:contact@carely.tn" className="text-carely-green hover:underline">contact@carely.tn</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-carely-dark">🌐</span>
                    <span>https://carely.tn</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Back to home */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="carely-btn-outline inline-flex items-center gap-2"
              >
                → الرجوع للرئيسية
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-carely-dark text-white pb-20 md:pb-0 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-0">
              <span className="text-xl font-extrabold text-carely-light">Carely</span>
              <span className="text-xl font-bold text-gray-400">.tn</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">الرئيسية</Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">سياسة الخصوصية</Link>
              <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">شروط الاستخدام</Link>
            </nav>
            <p className="text-sm text-gray-400">© 2025 Carely.tn</p>
          </div>
        </div>
      </footer>
    </>
  );
}
