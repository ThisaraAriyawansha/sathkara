"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const BackArrowIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export default function AuthLayout({ children, title, subtitle }) {
  const { lang, changeLang, t } = useLanguage();

  return (
    <main className="min-h-screen md:flex">
      {/* Brand panel — desktop/tablet only. On mobile this collapses away entirely
          so the form gets the full viewport, since most users land here on a phone. */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-[#F3EFE4] via-[#FAF8F5] to-[#EFE6D0] items-center justify-center px-12">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <Image
          src="/img/logo-icon.png"
          alt=""
          width={640}
          height={640}
          className="absolute w-[140%] max-w-none opacity-[0.06] pointer-events-none select-none"
          aria-hidden="true"
        />

        <a
          href="/"
          className="absolute top-6 left-6 lg:top-8 lg:left-8 flex items-center gap-2 text-charcoal/70 hover:text-primary text-sm font-medium transition"
        >
          <BackArrowIcon />
          {t("auth.backHome")}
        </a>

        <div className="relative flex flex-col items-center text-center gap-6 max-w-sm">
          <Image
            src="/img/5645675736776.png"
            alt="Sathkara"
            width={374}
            height={356}
            className="w-56 lg:w-64 h-auto"
            priority
          />
          <p className="text-charcoal/70 text-base leading-relaxed">
            {t("auth.tagline")}
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 md:w-1/2 lg:w-3/5 flex flex-col min-h-screen md:min-h-0">
        <div className="flex items-center justify-between px-5 py-4 md:hidden">
          <a
            href="/"
            className="flex items-center gap-1.5 min-h-[40px] -ml-1 pl-1 pr-2 text-slate hover:text-primary text-sm font-medium transition"
          >
            <BackArrowIcon />
            {t("auth.backHome")}
          </a>
          <button
            onClick={() => changeLang(lang === "si" ? "en" : "si")}
            className="min-w-[44px] min-h-[40px] px-3 rounded-full border border-border text-slate text-sm"
          >
            {lang === "si" ? "EN" : "සිං"}
          </button>
        </div>

        <div className="hidden md:flex justify-end px-8 lg:px-12 py-6">
          <button
            onClick={() => changeLang(lang === "si" ? "en" : "si")}
            className="min-w-[44px] min-h-[40px] px-3 rounded-full border border-border text-slate text-sm hover:border-primary hover:text-primary transition"
          >
            {lang === "si" ? "EN" : "සිං"}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-10 md:pb-16">
          <div className="w-full max-w-sm">
            <a href="/" className="flex md:hidden justify-center mb-6">
              <Image
                src="/img/5645675736776.png"
                alt="Sathkara"
                width={374}
                height={356}
                className="h-9 w-auto"
                priority
              />
            </a>

            <div className="mb-8 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-semibold text-charcoal">{title}</h1>
              {subtitle && <p className="text-slate text-sm mt-2">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
