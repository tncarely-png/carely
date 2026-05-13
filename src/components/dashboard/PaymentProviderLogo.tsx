'use client';

import { useState } from 'react';
import { Landmark } from 'lucide-react';
import { paymentProviderLogoUrl } from '@/lib/constants';

type Props = {
  domain: string;
  /** For accessibility when used without visible label */
  label: string;
  className?: string;
  /** Requested favicon size (Google s2 `sz`); rendered box uses className */
  size?: number;
};

export function PaymentProviderLogo({ domain, label, className = 'h-8 w-8', size = 64 }: Props) {
  const [failed, setFailed] = useState(false);
  const src = paymentProviderLogoUrl(domain, size);

  if (failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-carely-green/10 ${className}`}
        title={label}
        aria-hidden
      >
        <Landmark className="h-5 w-5 text-carely-green" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      role="presentation"
      className={`shrink-0 object-contain ${className}`}
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
