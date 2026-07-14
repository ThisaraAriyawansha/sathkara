"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { signup, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(name, email, password);
      router.push("/profile");
    } catch (err) {
      setError(t("auth.error"));
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
    <main className="min-h-screen">
      <Navbar />

      <div className="max-w-sm mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-primary mb-8 text-center">
          {t("auth.signupTitle")}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder={t("auth.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-[48px] px-4 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-base"
          />
          <input
            type="email"
            required
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[48px] px-4 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-base"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-[48px] px-4 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-base"
          />

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[48px] rounded-card bg-primary text-background font-medium disabled:opacity-60"
          >
            {t("auth.signupButton")}
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
          className="w-full min-h-[48px] rounded-card border border-border bg-surface font-medium disabled:opacity-60"
        >
          {t("auth.googleButton")}
        </button>

        <p className="text-center text-slate text-sm mt-8">
          {t("auth.haveAccount")}{" "}
          <a href="/login" className="text-primary font-medium">
            {t("auth.loginLink")}
          </a>
        </p>
      </div>
    </main>
  );
}
