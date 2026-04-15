'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

function isValidTunisianPhone(digits: string): boolean {
  return digits.length === 8 && /^[259]\d{7}$/.test(digits);
}

function LoginModalContent({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(60);
  const { toast } = useToast();

  const digits = phoneInput.replace(/\D/g, '');
  const isPhoneValid = isValidTunisianPhone(digits);

  // Countdown timer for resend
  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handlePhoneSubmit = () => {
    if (!isPhoneValid) return;
    setStep('otp');
    toast({
      title: 'Code envoyé',
      description: `Un code de vérification a été envoyé au +216 ${phoneInput}`,
    });
  };

  const handleOTPComplete = useCallback(
    (value: string) => {
      if (value.length === 6) {
        // Simulate success
        setTimeout(() => {
          onOpenChange(false);
          toast({
            title: 'Connexion réussie !',
            description: 'Bienvenue sur 9arini.tn',
          });
        }, 500);
      }
    },
    [onOpenChange, toast]
  );

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    toast({
      title: 'Code renvoyé',
      description: 'Un nouveau code de vérification a été envoyé.',
    });
  };

  return (
    <>
      {/* Brown accent top */}
      <div className="h-1 rounded-t-2xl bg-[#78350F]" />

      <div className="px-6 pb-6 pt-4">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-[#09090B]">
            {step === 'phone' ? 'Se connecter' : 'Vérification'}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#71717A]">
            {step === 'phone'
              ? 'Entrez votre numéro de téléphone tunisien'
              : `Entrez le code envoyé au +216 ${phoneInput}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' ? (
          <div className="mt-6">
            {/* Phone Input */}
            <div className="flex items-center gap-0 rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] p-1 transition-colors focus-within:border-[#78350F] focus-within:ring-2 focus-within:ring-[#78350F]/20">
              <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-[#09090B]">
                <span className="text-base">🇹🇳</span>
                <span className="text-[#71717A]">+216</span>
              </div>
              <Input
                type="tel"
                value={phoneInput}
                onChange={(e) => {
                  const raw = e.target.value;
                  const formatted = formatPhoneNumber(raw);
                  setPhoneInput(formatted);
                }}
                placeholder="XX XXX XXX"
                maxLength={11}
                className="h-11 flex-1 border-0 bg-transparent text-base font-semibold shadow-none focus-visible:ring-0"
              />
            </div>

            {/* Validation hint */}
            {digits.length > 0 && !isPhoneValid && (
              <p className="mt-2 text-xs text-[#ef4444]">
                Le numéro doit commencer par 2, 5 ou 9 et contenir 8 chiffres
              </p>
            )}

            {/* Submit Button */}
            <Button
              onClick={handlePhoneSubmit}
              disabled={!isPhoneValid}
              className="mt-4 h-12 w-full rounded-full bg-[#78350F] text-base font-bold text-white hover:bg-[#92400E] disabled:opacity-40"
            >
              Envoyer le code
            </Button>

            <p className="mt-4 text-center text-xs text-[#A1A1AA]">
              En continuant, vous acceptez nos{' '}
              <a href="#" className="underline hover:text-[#78350F]">
                Conditions d&apos;utilisation
              </a>
            </p>
          </div>
        ) : (
          <div className="mt-6">
            {/* OTP Input */}
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => {
                setOtpValue(value);
                handleOTPComplete(value);
              }}
              containerClassName="justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="h-12 w-12 rounded-lg border-[#E4E4E7] text-lg font-bold focus-visible:border-[#78350F] focus-visible:ring-[#78350F]/20 data-[active=true]:border-[#78350F] data-[active=true]:ring-[#78350F]/20" />
                <InputOTPSlot index={1} className="h-12 w-12 rounded-lg border-[#E4E4E7] text-lg font-bold focus-visible:border-[#78350F] focus-visible:ring-[#78350F]/20 data-[active=true]:border-[#78350F] data-[active=true]:ring-[#78350F]/20" />
                <InputOTPSlot index={2} className="h-12 w-12 rounded-lg border-[#E4E4E7] text-lg font-bold focus-visible:border-[#78350F] focus-visible:ring-[#78350F]/20 data-[active=true]:border-[#78350F] data-[active=true]:ring-[#78350F]/20" />
              </InputOTPGroup>
              <InputOTPSeparator className="text-[#D4D4D8]" />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="h-12 w-12 rounded-lg border-[#E4E4E7] text-lg font-bold focus-visible:border-[#78350F] focus-visible:ring-[#78350F]/20 data-[active=true]:border-[#78350F] data-[active=true]:ring-[#78350F]/20" />
                <InputOTPSlot index={4} className="h-12 w-12 rounded-lg border-[#E4E4E7] text-lg font-bold focus-visible:border-[#78350F] focus-visible:ring-[#78350F]/20 data-[active=true]:border-[#78350F] data-[active=true]:ring-[#78350F]/20" />
                <InputOTPSlot index={5} className="h-12 w-12 rounded-lg border-[#E4E4E7] text-lg font-bold focus-visible:border-[#78350F] focus-visible:ring-[#78350F]/20 data-[active=true]:border-[#78350F] data-[active=true]:ring-[#78350F]/20" />
              </InputOTPGroup>
            </InputOTP>

            {/* Resend */}
            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-xs text-[#A1A1AA]">
                  Renvoyer dans{' '}
                  <span className="font-bold text-[#78350F]">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-xs font-bold text-[#78350F] hover:underline"
                >
                  Renvoyer le code
                </button>
              )}
            </div>

            {/* Back Button */}
            <Button
              onClick={() => {
                setStep('phone');
                setOtpValue('');
              }}
              variant="ghost"
              className="mt-4 w-full text-sm font-medium text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#09090B]"
            >
              <ArrowLeft className="mr-2 size-4" />
              Modifier le numéro
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-2xl border-[#E4E4E7] p-0 sm:p-0">
        {/* Key forces remount when modal opens, resetting all state */}
        <LoginModalContent key={open ? 'open' : 'closed'} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
