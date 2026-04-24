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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, useAppStore } from '@/store';
import { isAdmin } from '@/lib/auth-user';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function LoginModalContent({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useAppStore((s) => s.navigate);

  const isEmailValid = isValidEmail(emailInput);

  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  const sendCode = async () => {
    if (!isEmailValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast({
          title: 'Erreur',
          description: data.error || 'Impossible d’envoyer le code',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      setStep('otp');
      setCountdown(60);
      setOtpValue('');
      toast({
        title: 'Code envoyé',
        description: `Vérifiez votre boîte : ${emailInput.trim()}`,
      });
    } catch {
      toast({ title: 'Erreur réseau', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleOTPComplete = useCallback(
    async (value: string) => {
      if (value.length !== 6 || loading) return;
      setLoading(true);
      try {
        const res = await fetch('/api/auth/otp-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailInput.trim(),
            code: value,
            action: 'login',
          }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.user);
          onOpenChange(false);
          toast({ title: 'Connexion réussie !', description: 'Bienvenue sur Carely.tn' });
          const logged = useAuthStore.getState().user;
          navigate(logged && isAdmin(logged) ? 'admin' : 'dashboard');
          return;
        }

        if (data.isNewUser) {
          toast({
            title: 'Nouveau compte',
            description: 'Complétez votre profil depuis la page Connexion du site.',
          });
          onOpenChange(false);
          navigate('login');
          return;
        }

        toast({
          title: 'Code invalide',
          description: data.error || 'Réessayez',
          variant: 'destructive',
        });
        setOtpValue('');
      } catch {
        toast({ title: 'Erreur réseau', variant: 'destructive' });
        setOtpValue('');
      }
      setLoading(false);
    },
    [emailInput, loading, navigate, onOpenChange, setUser, toast]
  );

  const handleResend = () => {
    if (countdown > 0 || loading) return;
    void sendCode();
  };

  return (
    <>
      <div className="h-1 rounded-t-2xl bg-[#78350F]" />

      <div className="px-6 pb-6 pt-4">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-[#09090B]">
            {step === 'email' ? 'Se connecter' : 'Vérification'}
          </DialogTitle>
          <DialogDescription className="text-sm text-[#71717A]">
            {step === 'email'
              ? 'Entrez votre adresse e-mail'
              : `Code envoyé à ${emailInput.trim()}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <div className="mt-6 space-y-4">
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="vous@exemple.com"
              className="h-11 text-base"
              dir="ltr"
              autoComplete="email"
            />
            {!isEmailValid && emailInput.length > 0 && (
              <p className="text-xs text-[#ef4444]">Adresse e-mail invalide</p>
            )}
            <Button
              onClick={() => void sendCode()}
              disabled={!isEmailValid || loading}
              className="h-12 w-full rounded-full bg-[#78350F] text-base font-bold text-white hover:bg-[#92400E] disabled:opacity-40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Envoi…
                </span>
              ) : (
                'Envoyer le code'
              )}
            </Button>
            <p className="text-center text-xs text-[#A1A1AA]">
              Connexion sécurisée par e-mail (Resend)
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => {
                setOtpValue(value);
                if (value.length === 6) void handleOTPComplete(value);
              }}
              disabled={loading}
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

            {loading && (
              <div className="mt-4 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#78350F]" />
              </div>
            )}

            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-xs text-[#A1A1AA]">
                  Renvoyer dans{' '}
                  <span className="font-bold text-[#78350F]">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs font-bold text-[#78350F] hover:underline"
                >
                  Renvoyer le code
                </button>
              )}
            </div>

            <Button
              type="button"
              onClick={() => {
                setStep('email');
                setOtpValue('');
              }}
              variant="ghost"
              className="mt-4 w-full text-sm font-medium text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#09090B]"
            >
              <ArrowLeft className="mr-2 size-4" />
              Modifier l’e-mail
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
        <LoginModalContent key={open ? 'open' : 'closed'} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}
