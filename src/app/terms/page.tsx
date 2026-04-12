import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "شروط الاستخدام — Carely.tn",
  description: "شروط استخدام منصة Carely.tn — الالتزامات والحقوق بين المستخدم والمنصة.",
};

export default function TermsOfServicePage() {
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
                شروط الاستخدام
              </h1>
              <p className="text-carely-gray text-sm">
                آخر تحديث: 1 يناير 2025
              </p>
            </div>

            <div className="carely-card p-6 md:p-8 space-y-8 text-carely-gray leading-relaxed" dir="rtl">
              {/* Intro */}
              <div>
                <p className="text-base leading-loose">
                  هذي شروط الاستخدام تحكم علاقتك بينك وبين <span className="font-bold text-carely-dark">Carely.tn</span> ("نحن"، "الموقع"، "الخدمة"). بالتسجيل أو استعمال الموقع، أنت توافق على هذي الشروط. إذا ماكنتش موافق، ما تستعملش الخدمة.
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">1</span>
                  الخدمة
                </h2>
                <p className="text-sm mb-3">
                  Carely.tn هي منصة تونسية لبيع اشتراكات <strong className="text-carely-dark">Qustodio</strong> — برنامج حماية الأطفال على الإنترنت. الخدمات اللي نقدموها تشمل:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>بيع اشتراكات Qustodio Silver و Gold بالدينار التونسي</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>تفعيل الاشتراك وتسليم بيانات الدخول لبرنامج Qustodio</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>الدعم الفني عبر واتساب والإيميل</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>إدارة الاشتراكات والتجديد</span></li>
                </ul>
              </div>

              {/* Section 2 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">2</span>
                  التسجيل والحساب
                </h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>لازم يكون عندك رقم هاتف تونسي صحيح باش تسجّل حساب.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>الدخول للحساب يكون فقط برمز OTP يوصلك على هاتفك — ما فيش كلمة سر.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>أنت مسؤول على حفظ سرية هاتفك وكود التفعيل.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>كل شخص لازم يسجّل حسابه الخاص — ما تشاركش حسابك مع حد.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>المعلومات اللي تدخلها لازم تكون صحيحة ودقيقة.</span></li>
                </ul>
              </div>

              {/* Section 3 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">3</span>
                  الأسعار والدفع
                </h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>الأسعار معروضة بالدينار التونسي (دت) وتشمل ضريبة القيمة المضافة.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>نقبلو الدفع عبر: فلوسي، D17، كارت بنكي، تحويل بنكي، أو دفع عند الاستلام.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>الاشتراك يبدأ بعد تأكيد الدفع وتفعيله من طرف فريقنا.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>كل اشتراك يغطي سنة كاملة (12 شهر) من تاريخ التفعيل.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>نحتفظو بحق تغيير الأسعار في أي وقت مع إشعار مسبق للمستخدمين الحاليين.</span></li>
                </ul>
              </div>

              {/* Section 4 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">4</span>
                  الاسترداد والاسترجاع
                </h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>عندك حق طلب استرداد كامل خلال <strong className="text-carely-dark">7 أيام</strong> من تاريخ الشراء إذا ماكنتش راضي.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>إذا تم تفعيل الاشتراك واستعملته، ما نقدروش نرجعو الفلوس.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>الاسترداد يتم بنفس طريقة الدفع الأصلية في غضون 5-7 أيام عمل.</span></li>
                </ul>
              </div>

              {/* Section 5 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">5</span>
                  استخدام الخدمة بطريقة صحيحة
                </h2>
                <p className="text-sm mb-3">تلتزم بالاستعمال الخدمة بطريقة قانونية وأخلاقية. تحديدًا ما:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span><span>ما تستعملش الخدمة لأي غرض غير قانوني أو مخالف للقانون التونسي.</span></li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span><span>ما تنشرش أو ما تشاركش بيانات الدخول (Qustodio email/password) مع أي شخص.</span></li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span><span>ما تحاولش اختراق أو تقويض أمان الموقع أو الخدمات.</span></li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span><span>ما تعملش نسخ غير مصرح بها من المحتوى أو الخدمات.</span></li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">✕</span><span>ما تستعملش الخدمة لمراقبة أشخاص بالغين بدون علمهم.</span></li>
                </ul>
              </div>

              {/* Section 6 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">6</span>
                  الملكية الفكرية
                </h2>
                <p className="text-sm">
                  كل المحتوى على الموقع (نصوص، صور، شعارات، تصميم) هو ملك لـ Carely.tn أو مرخص لنا. Qustodio هي علامة تجارية ملك لـ Qustodio S.L. نحن موزع معتمد وليسنا المالك الأصلي للبرنامج. ما تقدرش تستعمل أي محتوى من الموقع بدون إذن كتابي منا.
                </p>
              </div>

              {/* Section 7 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">7</span>
                  حدود المسؤولية
                </h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>Carely.tn هي وسيط لبيع اشتراكات Qustodio — ما نتحمّلوش مسؤولية عن أي مشكل تقني في برنامج Qustodio نفسه.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>ما نتحمّلوش مسؤولية عن أي أضرار غير مباشرة ناتجة عن استعمال أو عدم استعمال الخدمة.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>الخدمة متاحة &quot;كما هي&quot; بدون أي ضمان صريح أو ضمني خارج ما هو منصوص عليه في هذي الشروط.</span></li>
                </ul>
              </div>

              {/* Section 8 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">8</span>
                  إنهاء الحساب
                </h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>تقدر تحذف حسابك في أي وقت من صفحة حسابك أو بالتواصل معانا.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>إذا انتهى اشتراكك وماعادش تجدده، نحتفظو بحسابك ومعلوماتك لمدة سنة بعد الانتهاء.</span></li>
                  <li className="flex items-start gap-2"><span className="text-carely-green mt-0.5">●</span><span>نحتفظو بحق إيقاف أو إنهاء حسابك إذا خالفت هذي الشروط أو استعملت الخدمة بطريقة خاطئة.</span></li>
                </ul>
              </div>

              {/* Section 9 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">9</span>
                  القانون المطبق
                </h2>
                <p className="text-sm">
                  هذي الشروط تخضع للقانون التونسي. أي نزاع ينشأ بين الطرفين يتم حله بالطرق الودية أولًا، وإذا ما تحلش يتم اللجوء للمحاكم المختصة في تونس العاصمة.
                </p>
              </div>

              {/* Section 10 */}
              <div>
                <h2 className="text-lg font-bold text-carely-dark mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-carely-green text-white text-sm flex items-center justify-center shrink-0">10</span>
                  تواصل معانا
                </h2>
                <p className="text-sm mb-3">إذا عندك أي سؤال على هذي الشروط، تواصل معانا:</p>
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
              <Link href="/" className="carely-btn-outline inline-flex items-center gap-2">
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
