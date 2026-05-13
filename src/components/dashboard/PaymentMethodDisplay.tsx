'use client';

import { PAYMENT_METHODS } from '@/lib/constants';
import { PaymentProviderLogo } from '@/components/dashboard/PaymentProviderLogo';

type Props = {
  methodId: string;
  /** Smaller icon/text for dense tables */
  compact?: boolean;
  className?: string;
};

export function PaymentMethodDisplay({ methodId, compact, className }: Props) {
  const pm = PAYMENT_METHODS.find((p) => p.id === methodId);
  if (!pm) {
    return (
      <span className={`font-mono text-carely-gray ${compact ? 'text-xs' : 'text-sm'} ${className ?? ''}`}>
        {methodId}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 text-carely-gray ${className ?? ''}`}>
      <PaymentProviderLogo
        domain={pm.logoDomain}
        label={pm.nameAr}
        className={compact ? 'h-5 w-5' : 'h-6 w-6'}
        size={48}
      />
      <span className={compact ? 'text-xs' : 'text-sm'}>{pm.nameAr}</span>
    </span>
  );
}
