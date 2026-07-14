"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="pb-24 md:pb-0">
      <Navbar />

      <section className="max-w-3xl mx-auto text-center px-6 py-14 md:py-20">
        <h1 className="text-2xl md:text-4xl font-semibold text-primary mb-3 leading-snug">
          {t("home.tagline")}
        </h1>
        <p className="text-slate text-base md:text-lg">{t("home.subtitle")}</p>
      </section>

      {/* Donation feed will be added in the next stage */}

      <BottomNav activePath="/" />
    </main>
  );
}
