'use client';

import { useState, useRef, useCallback } from 'react';
import { useAppStore, useAuthStore } from '@/store';
import { PLANS, PAYMENT_METHODS, WHATSAPP_NUMBER } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  ImageIcon,
  X,
  MessageCircle,
  Smartphone,
  Landmark,
  Mail,
  Clock,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'اختار الباقة' },
  { id: 2, label: 'الدفع' },
  { id: 3, label: 'ارفع الوصل' },
  { id: 4, label: 'في الانتظار' },
];

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  flouci: <Smartphone className="h-6 w-6 text-carely-green" />,
  virement: <Landmark className="h-6 w-6 text-carely-green" />,
  ccp: <Mail className="h-6 w-6 text-carely-green" />,
};

const PAYMENT_LABELS: Record<string, string> = {
  flouci: 'Flouci',
  virement: 'Virement Bancaire',
  ccp: 'CCP',
};

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useAppStore((s) => s.navigate);
  const setSelectedPlan = useAppStore((s) => s.setSelectedPlan);
  const setSelectedPaymentMethod = useAppStore((s) => s.setSelectedPaymentMethod);
  const setSelectedPlanName = useAppStore((s) => s.setSelectedPlanName);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlanKey, setSelectedPlanKey] = useState<'silver' | 'gold' | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'flouci' | 'virement' | 'ccp' | null>(null);
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPlan = selectedPlanKey ? PLANS[selectedPlanKey] : null;
  const selectedPm = PAYMENT_METHODS.find((p) => p.id === selectedPayment);

  const goNext = () => {
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
    }
  };
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSelectPlan = (key: 'silver' | 'gold') => {
    setSelectedPlanKey(key);
    setSelectedPlan(key);
    setSelectedPlanName(PLANS[key].displayName);
  };

  const handleSelectPayment = (method: 'flouci' | 'virement' | 'ccp') => {
    setSelectedPayment(method);
    setSelectedPaymentMethod(method);
  };

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('الملف لازم يكون صورة (JPG, PNG) أو PDF');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('حجم الملف لازم يكون أقل من 10 ميݣا');
      return;
    }
    setError('');
    setReceiptName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptFile(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDF, still read as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptFile(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async () => {
    if (!selectedPlanKey || !selectedPayment) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('لازم تملا كل الخانات');
      return;
    }
    if (!receiptFile) {
      setError('لازم ترفع صورة الوصل');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlanKey,
          paymentMethod: selectedPayment,
          receiptData: receiptFile,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCurrentStep(4);
      } else {
        setError('حصل مشكل أثناء إرسال الطلب. جرب مرة أخرى');
      }
    } catch {
      setError('حصل مشكل في الاتصال. تحقق من النت و جرب مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step Indicator ────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? 'bg-carely-green text-white'
                    : isActive
                      ? 'bg-carely-green text-white ring-4 ring-carely-green/20'
                      : 'bg-gray-200 text-carely-gray'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : step.id}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 text-center font-semibold ${
                  isActive || isCompleted ? 'text-carely-green' : 'text-carely-gray'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-6 sm:w-10 mx-1 rounded-full transition-all ${
                  currentStep > step.id ? 'bg-carely-green' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // ─── WhatsApp Help ─────────────────────────────────────────
  const WhatsAppHelp = () => (
    <div className="mt-6 text-center">
      <p className="text-sm text-carely-gray mb-2">محتاج مساعدة؟ 💬</p>
      <Button asChild variant="outline" className="carely-btn-outline h-10 text-sm">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=مرحبا، عندي سؤال على الطلب`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-4 w-4 ml-1" />
          تواصل على واتساب
        </a>
      </Button>
    </div>
  );

  // ─── STEP 1: Plan Selection ────────────────────────────────
  const StepPlanSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-extrabold text-carely-dark">اختار باقتك</h2>
        <p className="text-sm text-carely-gray mt-1">اختار الباقة المناسبة لعائلتك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {(['silver', 'gold'] as const).map((key) => {
          const plan = PLANS[key];
          const isSelected = selectedPlanKey === key;
          return (
            <Card
              key={key}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                plan.featured ? 'carely-card-featured' : 'carely-card'
              } ${isSelected ? 'ring-4 ring-carely-green/30 scale-[1.02]' : ''}`}
              onClick={() => handleSelectPlan(key)}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-carely-gold text-white text-xs font-bold px-3 py-1 rounded-full">
                  الأفضل
                </div>
              )}
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{plan.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-carely-dark">{plan.displayName}</h3>
                    <p className="text-xs text-carely-gray">{plan.duration}</p>
                  </div>
                  {isSelected && (
                    <div className="mr-auto w-6 h-6 rounded-full bg-carely-green flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-carely-green">{plan.priceTnd}</span>
                  <span className="text-sm text-carely-gray mr-1">دت / سنة</span>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-carely-gray">
                  <Smartphone className="h-4 w-4" />
                  <span>{plan.devices} أجهزة</span>
                </div>

                <Separator className="my-4" />

                <ul className="space-y-2.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-carely-gray">
                      <Check className="h-4 w-4 text-carely-green shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full mt-5 h-11 text-sm font-bold ${
                    isSelected
                      ? 'carely-btn-primary'
                      : 'carely-btn-outline'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(key);
                  }}
                >
                  {isSelected ? '✓ مختارة' : 'اختار هذه الباقة'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlanKey && (
        <div className="flex justify-center">
          <Button className="carely-btn-primary h-12 text-base px-10" onClick={goNext}>
            متابعة
            <ArrowLeft className="h-5 w-5 mr-2" />
          </Button>
        </div>
      )}

      <WhatsAppHelp />
    </div>
  );

  // ─── STEP 2: Payment Method ────────────────────────────────
  const StepPayment = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-extrabold text-carely-dark">طريقة الدفع</h2>
        <p className="text-sm text-carely-gray mt-1">اختار كيف تحب تدفع</p>
      </div>

      {/* Amount display */}
      {selectedPlan && (
        <Card className="carely-card carely-top-accent">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm font-bold text-carely-dark">المبلغ:</span>
            <span className="text-2xl font-extrabold text-carely-green">
              {selectedPlan.priceTnd} دت
            </span>
          </CardContent>
        </Card>
      )}

      {/* Payment method cards */}
      <div className="space-y-3">
        {PAYMENT_METHODS.map((pm) => {
          const isSelected = selectedPayment === pm.id;
          return (
            <Card
              key={pm.id}
              className={`carely-card cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-carely-green bg-carely-mint' : ''
              }`}
              onClick={() => handleSelectPayment(pm.id as 'flouci' | 'virement' | 'ccp')}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-carely-green/10' : 'bg-gray-50'
                  }`}
                >
                  {PAYMENT_ICONS[pm.id]}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-carely-dark text-sm">{pm.name}</p>
                  <p className="text-xs text-carely-gray mt-0.5">{pm.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-carely-green bg-carely-green'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* WhatsApp payment note */}
      {selectedPayment && (
        <div className="bg-carely-mint border border-carely-light rounded-xl p-4 text-center">
          <p className="text-sm text-carely-dark font-semibold">
            💬 تقدر ترسل المبلغ مباشرة على واتساب
          </p>
          <Button asChild variant="outline" className="carely-btn-outline h-9 text-xs mt-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=مرحبا، نحب ندفع بالمبلغ ل${PAYMENT_LABELS[selectedPayment]}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-3.5 w-3.5 ml-1" />
              أرسل على واتساب
            </a>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" className="carely-btn-outline h-11 text-sm" onClick={goBack}>
          <ArrowRight className="h-4 w-4 ml-1" />
          رجوع
        </Button>
        {selectedPayment && (
          <Button className="carely-btn-primary h-11 text-sm px-8" onClick={goNext}>
            متابعة
            <ArrowLeft className="h-4 w-4 mr-1" />
          </Button>
        )}
      </div>

      <WhatsAppHelp />
    </div>
  );

  // ─── STEP 3: Receipt Upload ────────────────────────────────
  const StepReceipt = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-extrabold text-carely-dark">ارفع وصل الدفع</h2>
        <p className="text-sm text-carely-gray mt-1">ارفع صورة أو وصل الدفع باش نأكدو الطلب</p>
      </div>

      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          receiptFile
            ? 'border-carely-green bg-carely-mint'
            : 'border-gray-300 hover:border-carely-green hover:bg-carely-mint/50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {receiptFile ? (
          <div className="space-y-3">
            {receiptFile.startsWith('data:image') ? (
              <div className="relative inline-block">
                <img
                  src={receiptFile}
                  alt="وصل الدفع"
                  className="max-h-40 rounded-lg mx-auto object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReceiptFile(null);
                    setReceiptName('');
                  }}
                  className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <ImageIcon className="h-8 w-8 text-carely-green" />
                <span className="text-sm font-semibold text-carely-dark">{receiptName}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReceiptFile(null);
                    setReceiptName('');
                  }}
                  className="mr-2 text-red-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-carely-green font-semibold">✓ الوصل مرفوع</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-10 w-10 text-carely-gray mx-auto" />
            <p className="font-bold text-carely-dark text-sm">📎 ارفع صورة وصل الدفع</p>
            <p className="text-xs text-carely-gray">اضغط هنا أو اسحب الصورة</p>
            <p className="text-xs text-carely-gray">JPG, PNG, PDF — حتى 10 ميݣا</p>
          </div>
        )}
      </div>

      {/* Customer Info Form */}
      <Card className="carely-card">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-bold text-carely-dark text-sm">بياناتك</h3>

          <div className="space-y-2">
            <Label htmlFor="customerName" className="text-sm text-carely-gray font-semibold">
              الاسم الكامل <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="text-sm text-carely-gray font-semibold">
              رقم الهاتف <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="رقم الهاتف (واتساب)"
              className="h-11"
              dir="ltr"
              type="tel"
            />
          </div>

          {/* Order Summary */}
          {selectedPlan && (
            <>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-carely-gray">الباقة</span>
                  <span className="font-bold text-carely-dark">
                    {selectedPlan.icon} {selectedPlan.displayName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carely-gray">طريقة الدفع</span>
                  <span className="font-bold text-carely-dark">
                    {selectedPm?.name || '—'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-carely-gray font-bold">المبلغ</span>
                  <span className="text-lg font-extrabold text-carely-green">
                    {selectedPlan.priceTnd} دت
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center font-medium">
          {error}
        </div>
      )}

      {/* WhatsApp receipt note */}
      <div className="bg-carely-mint border border-carely-light rounded-xl p-4 text-center">
        <p className="text-sm text-carely-dark font-semibold">
          💬 تقدر ترسل الوصل مباشرة على واتساب:{' '}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=مرحبا، بعتلكم وصل الدفع`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-carely-green underline font-bold"
          >
            wa.me/21626107128
          </a>
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" className="carely-btn-outline h-11 text-sm" onClick={goBack}>
          <ArrowRight className="h-4 w-4 ml-1" />
          رجوع
        </Button>
        <Button
          className="carely-btn-primary h-12 text-base px-8 w-full sm:w-auto disabled:opacity-60"
          onClick={handleSubmit}
          disabled={loading || !customerName.trim() || !customerPhone.trim() || !receiptFile}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري الإرسال...
            </span>
          ) : (
            'أرسل الطلب'
          )}
        </Button>
      </div>

      <WhatsAppHelp />
    </div>
  );

  // ─── STEP 4: Pending Confirmation ──────────────────────────
  const StepPending = () => {
    const waMessage = customerName
      ? `مرحبا، اسمي ${customerName}، عندي طلب في الانتظار`
      : 'مرحبا، عندي طلب في الانتظار';

    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-full max-w-md space-y-6 text-center">
          {/* Animated hourglass */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-carely-green flex items-center justify-center">
              <Clock className="h-10 w-10 text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-carely-dark">
            طلبك وصلنا! ✅
          </h1>
          <p className="text-carely-gray text-sm sm:text-base leading-relaxed">
            راح نراجع وصل الدفع بتاعك ونسلمك الحساب في أقل من 24 ساعة. نتواصل معاك على
            الواتساب على الرقم اللي عطيتنا
          </p>

          {/* Order Summary */}
          <Card className="carely-card carely-top-accent text-right">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold text-carely-dark text-sm">ملخص الطلب</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-carely-gray">الباقة</span>
                  <span className="font-semibold text-carely-dark">
                    {selectedPlan
                      ? `${selectedPlan.icon} ${selectedPlan.displayName}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carely-gray">المبلغ</span>
                  <span className="font-semibold text-carely-green">
                    {selectedPlan ? `${selectedPlan.priceTnd} دت` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carely-gray">طريقة الدفع</span>
                  <span className="font-semibold text-carely-dark">
                    {selectedPm?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carely-gray">الحالة</span>
                  <span className="font-semibold text-yellow-600">في الانتظار ⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp CTA */}
          <Button asChild className="carely-btn-primary h-12 text-base w-full">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-5 w-5 ml-2" />
              📲 تابع طلبك على واتساب
            </a>
          </Button>

          <p className="text-xs text-carely-gray">
            أي سؤال؟ تواصل معانا في أي وقت على واتساب 💬
          </p>
        </div>
      </div>
    );
  };

  // ─── Main Render ───────────────────────────────────────────
  if (!user) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-carely-gray">لازم تسجل أول باش تقدر تشتري</p>
        <Button className="carely-btn-primary mt-4" onClick={() => navigate('login')}>
          سجل دخول
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6" dir="rtl">
      <StepIndicator />

      {currentStep === 1 && <StepPlanSelection />}
      {currentStep === 2 && <StepPayment />}
      {currentStep === 3 && <StepReceipt />}
      {currentStep === 4 && <StepPending />}
    </div>
  );
}
