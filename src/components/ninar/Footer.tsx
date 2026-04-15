import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const productLinks = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'Sécurité', href: '#' },
  { label: 'API', href: '#' },
];

const supportLinks = [
  { label: 'Aide', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Status', href: '#' },
  { label: 'Blog', href: '#' },
];

const legalLinks = [
  { label: 'Confidentialité', href: '#' },
  { label: 'CGU', href: '#' },
  { label: 'Mentions légales', href: '#' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

interface FooterProps {
  onLoginClick: () => void;
}

export function Footer({ onLoginClick }: FooterProps) {
  return (
    <footer id="contact" className="border-t border-[#E4E4E7] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-0.5 text-xl font-extrabold">
              <span className="text-[#78350F]">9arini</span>
              <span className="text-[#A1A1AA]">.tn</span>
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#71717A]">
              La plateforme tunisienne pour les cours particuliers.
            </p>
            {/* Social Icons */}
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-full border border-[#E4E4E7] text-[#A1A1AA] transition-colors hover:border-[#78350F] hover:bg-[#FFFBEB] hover:text-[#78350F]"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Produit */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-[#09090B]">Produit</h4>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#71717A] transition-colors hover:text-[#09090B]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-[#09090B]">Support</h4>
            <ul className="flex flex-col gap-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#71717A] transition-colors hover:text-[#09090B]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-[#09090B]">Légal</h4>
            <ul className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#71717A] transition-colors hover:text-[#09090B]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E4E4E7] pt-8 sm:flex-row">
          <p className="text-xs text-[#A1A1AA]">
            © 2025 9arini.tn — Tous droits réservés
          </p>
          <Button
            onClick={onLoginClick}
            className="rounded-full bg-[#78350F] px-6 text-xs font-bold text-white hover:bg-[#92400E]"
          >
            Se connecter
          </Button>
        </div>
      </div>
    </footer>
  );
}
