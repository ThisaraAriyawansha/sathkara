"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AuthLayout from "@/components/AuthLayout";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, GoogleLogo } from "@/components/AuthIcons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      router.push("/profile");
    } catch (err) {
      setError(err.message === "account-disabled" ? t("auth.blocked") : t("auth.error"));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
      router.push("/profile");
    } catch (err) {
      setError(err.message === "account-disabled" ? t("auth.blocked") : t("auth.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="relative">
          <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[52px] pl-11 pr-4 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base transition"
          />
        </div>

        <div className="relative">
          <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-[52px] pl-11 pr-11 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate hover:text-primary transition"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full min-h-[52px] rounded-2xl bg-primary text-background font-medium shadow-sm hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 transition mt-1"
        >
          {busy ? "..." : t("auth.loginButton")}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-slate text-sm">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={busy}
        className="w-full min-h-[52px] flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface font-medium hover:bg-black/[0.02] hover:border-charcoal/20 active:scale-[0.99] disabled:opacity-60 transition"
      >
        <GoogleLogo />
        {t("auth.googleButton")}
      </button>

      <p className="text-center text-slate text-sm mt-8">
        {t("auth.noAccount")}{" "}
        <a href="/signup" className="text-primary font-medium">
          {t("auth.signupLink")}
        </a>
      </p>
    </AuthLayout>
  );
}
