"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const HomeIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#556B2F" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const AddIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#556B2F" : "#6B7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function BottomNav({ activePath = "/" }) {
  const { t } = useLanguage();
  const { user } = useAuth();

  const isActive = (path) => activePath === path;
  const profileHref = user ? "/profile" : "/login";
  const addHref = user ? "/add" : "/login";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/20 backdrop-blur-sm border-t border-border/20 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 relative">
        <a
          href="/"
          className="flex flex-col items-center justify-center min-w-[52px] min-h-[42px] gap-0.5"
        >
          <HomeIcon active={isActive("/")} />
          <span className={`text-[10px] ${isActive("/") ? "text-primary font-medium" : "text-slate"}`}>
            {t("nav.home")}
          </span>
        </a>

        {/* Center raised Add button — primary action, largest tap target */}
        <a
          href={addHref}
          className="flex flex-col items-center justify-center -mt-5 relative"
        >
          <span className="absolute inset-0 -m-2 rounded-full bg-primary/25 blur-md -z-10" />
          <span className="w-11 h-11 rounded-full bg-primary/50 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <AddIcon />
          </span>
        </a>

        <a
          href={profileHref}
          className="flex flex-col items-center justify-center min-w-[52px] min-h-[42px] gap-0.5"
        >
          <ProfileIcon active={isActive("/profile")} />
          <span className={`text-[10px] ${isActive("/profile") ? "text-primary font-medium" : "text-slate"}`}>
            {t("nav.profile")}
          </span>
        </a>
      </div>
    </nav>
  );
}
