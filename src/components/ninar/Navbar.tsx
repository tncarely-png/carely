'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const navLinks = [
  { label: 'Accueil', href: '#' },
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

const languages = ['FR', 'TN', 'EN'];

interface NavbarProps {
  onLoginClick: () => void;
}

export function Navbar({ onLoginClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeLang, setActiveLang] = useState('FR');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        className={`transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_1px_0_0_#E4E4E7]' : ''
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="#" className="flex items-center gap-0.5 text-xl font-extrabold">
            <span className="text-[#78350F]">9arini</span>
            <span className="text-[#A1A1AA]">.tn</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#71717A] transition-colors hover:text-[#09090B]"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden items-center gap-4 md:flex">
            {/* Language Switcher */}
            <div className="flex items-center rounded-full border border-[#E4E4E7] p-0.5">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    activeLang === lang
                      ? 'bg-[#78350F] text-white shadow-sm'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Login Button */}
            <Button
              onClick={onLoginClick}
              className="rounded-full bg-[#78350F] px-6 font-bold text-white hover:bg-[#92400E]"
            >
              Se connecter
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-3 md:hidden">
            <Button
              onClick={onLoginClick}
              className="rounded-full bg-[#78350F] px-4 text-xs font-bold text-white hover:bg-[#92400E]"
            >
              Se connecter
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#09090B]">
                  <Menu className="size-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-0.5 text-lg">
                    <span className="text-[#78350F]">9arini</span>
                    <span className="text-[#A1A1AA]">.tn</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        className="rounded-lg px-4 py-3 text-sm font-medium text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#09090B]"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}
                </div>

                {/* Mobile Language Switcher */}
                <div className="mt-6 px-4">
                  <p className="mb-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    Langue
                  </p>
                  <div className="flex items-center rounded-full border border-[#E4E4E7] p-0.5">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-all ${
                          activeLang === lang
                            ? 'bg-[#78350F] text-white shadow-sm'
                            : 'text-[#71717A] hover:text-[#09090B]'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto px-4 pb-6">
                  <SheetClose asChild>
                    <Button
                      onClick={onLoginClick}
                      className="w-full rounded-full bg-[#78350F] font-bold text-white hover:bg-[#92400E]"
                    >
                      Se connecter
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
