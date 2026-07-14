"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { lang, changeLang, t } = useLanguage();
  const { user, profile, logout } = useAuth();

  return (
    <nav className="w-full border-b border-border bg-surface sticky top-0 z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <a href="/" className="text-lg md:text-xl font-semibold text-primary">
          සත්කාර
        </a>

        <div className="flex items-center gap-4">
          {/* Desktop-only text nav — mobile users get the bottom tab bar instead */}
          <div className="hidden md:flex items-center gap-6 text-sm text-charcoal">
            <a href="/" className="hover:text-primary transition">{t("nav.home")}</a>
            {user ? (
              <>
                <a href="/add" className="hover:text-primary transition">{t("nav.addDonation")}</a>
                <a href="/profile" className="hover:text-primary transition">{t("nav.profile")}</a>
                {profile?.role === "admin" && (
                  <a href="/admin" className="hover:text-primary transition">{t("nav.admin")}</a>
                )}
                <button onClick={logout} className="hover:text-primary transition">{t("nav.logout")}</button>
              </>
            ) : (
              <a href="/login" className="hover:text-primary transition">{t("nav.login")}</a>
            )}
          </div>

          <button
            onClick={() => changeLang(lang === "si" ? "en" : "si")}
            className="min-w-[44px] min-h-[44px] px-3 rounded-full border border-border text-slate hover:border-primary hover:text-primary transition text-sm"
          >
            {lang === "si" ? "EN" : "සිං"}
          </button>
        </div>
      </div>
    </nav>
  );
}
