'use client';

import Avvvatars from 'avvvatars-react';

export function avatarValueFromUser(user: {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  id?: string;
}): string {
  const v = user.email?.trim() || user.phone?.trim() || user.name?.trim() || user.id || 'carely';
  return v.toLowerCase();
}

type Props = {
  user: {
    email?: string | null;
    phone?: string | null;
    name?: string | null;
    id?: string;
  };
  size?: number;
  className?: string;
};

export default function UserAvatar({ user, size = 40, className = '' }: Props) {
  const value = avatarValueFromUser(user);
  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full ring-2 ring-carely-light ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Avvvatars value={value} size={size} style="shape" />
    </div>
  );
}
