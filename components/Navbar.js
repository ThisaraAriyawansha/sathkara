"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function Navbar({ transparent = false }) {
  const { lang, changeLang, t } = useLanguage();
  const { user, profile, logout } = useAuth();

  return (
    <nav
      className={`w-full z-40 ${
        transparent
          ? "absolute inset-x-0 top-0 border-transparent bg-transparent"
          : "border-b border-border bg-surface sticky top-0"
      }`}
    >
      <div className="relative max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/img/logo.png"
            alt="Sathkara"
            width={468}
            height={533}
            className="h-9 md:h-11 w-auto"
            priority
          />
          <span className="text-lg md:text-xl font-semibold text-primary tracking-wide">
            සත්කාර
          </span>
        </a>

        {/* Desktop-only text nav, centered — mobile users get the bottom tab bar instead */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <a href="/" className="hover:text-primary transition">{t("nav.home")}</a>
          {user && (
            <>
              <a href="/add" className="hover:text-primary transition">{t("nav.addDonation")}</a>
              <a href="/profile" className="hover:text-primary transition">{t("nav.profile")}</a>
              {profile?.role === "admin" && (
                <a href="/admin" className="hover:text-primary transition">{t("nav.admin")}</a>
              )}
              <button onClick={logout} className="hover:text-primary transition">{t("nav.logout")}</button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => changeLang(lang === "si" ? "en" : "si")}
            className="min-w-[44px] min-h-[44px] px-3 rounded-full border border-border text-slate hover:border-primary hover:text-primary transition text-sm"
          >
            {lang === "si" ? "EN" : "සිං"}
          </button>

          {user ? (
            <a
              href="/profile"
              className="hidden sm:flex items-center gap-2 min-h-[44px] pl-3 pr-4 rounded-full bg-primary text-background text-sm font-medium hover:bg-primary/90 transition"
            >
              <UserIcon />
              {profile?.name || t("nav.profile")}
            </a>
          ) : (
            <a
              href="/login"
              className="flex items-center gap-2 min-h-[44px] pl-3 pr-4 rounded-full bg-primary text-background text-sm font-medium hover:bg-primary/90 transition"
            >
              <UserIcon />
              {t("nav.login")}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
