"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import DonationCard from "@/components/DonationCard";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const SyncIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a9 9 0 0 1 4 7" />
    <path d="M21 3v5h-5" />
    <path d="M7 21a9 9 0 0 1-4-7" />
    <path d="M3 21v-5h5" />
  </svg>
);

const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13c0-5 4-11 8-13 4 2 8 8 8 13a7 7 0 0 1-7 7c-2 0-3-1-3-1" />
    <path d="M4 13c4 0 8-4 8-9" />
  </svg>
);

const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const q = query(
          collection(db, "donations"),
          where("visibility", "==", "public"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snap = await getDocs(q);
        setDonations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setFeedLoading(false);
      }
    };
    loadFeed();
  }, []);

  const features = [
    { Icon: ShieldIcon, title: t("home.features.secureTitle"), desc: t("home.features.secureDesc") },
    { Icon: SyncIcon, title: t("home.features.syncTitle"), desc: t("home.features.syncDesc") },
    { Icon: LeafIcon, title: t("home.features.simpleTitle"), desc: t("home.features.simpleDesc") },
    { Icon: HeartIcon, title: t("home.features.heartfeltTitle"), desc: t("home.features.heartfeltDesc") },
  ];

  return (
    <main className="relative pb-24 md:pb-0">
      <Navbar transparent />

      <section className="relative overflow-hidden px-6 py-20 md:py-28 min-h-[480px] md:min-h-[600px] flex items-center">
        <Image
          src="/img/67436467.png"
          alt="Buddhist stupa and lotus flower by a calm lake at sunrise"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/35 to-transparent" />

        <div className="relative max-w-3xl w-full mx-auto">
          <h1 className="animate-fade-in-up text-5xl sm:text-6xl md:text-7xl font-bold text-primary mb-4 tracking-wide">
            සත්කාර
          </h1>
          <p
            className="animate-fade-in-up text-lg sm:text-xl md:text-2xl font-medium text-accent mb-4 leading-snug"
            style={{ animationDelay: "0.12s" }}
          >
            {t("home.tagline")}
          </p>

          <div
            className="animate-fade-in-up flex items-center gap-3 my-5"
            style={{ animationDelay: "0.18s" }}
          >
            <span className="h-px w-10 bg-accent/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="h-px w-10 bg-accent/50" />
          </div>

          <p
            className="animate-fade-in-up text-charcoal/80 text-base md:text-lg mb-8"
            style={{ animationDelay: "0.24s" }}
          >
            {t("home.subtitle")}
          </p>

          <div
            className="animate-fade-in-up flex flex-col sm:flex-row items-start sm:items-center gap-3"
            style={{ animationDelay: "0.36s" }}
          >
            <a
              href={user ? "/add" : "/login"}
              className="min-h-[48px] px-7 flex items-center justify-center rounded-full bg-primary text-background font-medium text-sm md:text-base shadow-lg hover:bg-primary/90 transition"
            >
              {t("home.cta")}
            </a>
            <a
              href="#donations"
              className="min-h-[48px] px-7 flex items-center justify-center gap-2 rounded-full border border-primary text-primary font-medium text-sm md:text-base hover:bg-primary/5 transition"
            >
              <PlayIcon />
              {t("home.viewDonationsCta")}
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-8 md:-mt-10 relative z-10">
        <div className="animate-fade-in-up bg-surface rounded-card border border-border shadow-md grid grid-cols-2 md:grid-cols-4 divide-y divide-border md:divide-y-0 md:divide-x">
          {features.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 px-5 py-5">
              <span className="shrink-0 w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Icon />
              </span>
              <div>
                <p className="text-sm font-medium text-charcoal">{title}</p>
                <p className="text-xs text-slate">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section id="donations" className="max-w-5xl mx-auto px-4 md:px-6 py-16">
        {feedLoading ? (
          <p className="text-center text-slate py-10">...</p>
        ) : donations.length === 0 ? (
          <p className="text-center text-slate py-10">{t("home.noDonations")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {donations.map((donation) => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        )}
      </section>

      <BottomNav activePath="/" />
    </main>
  );
}
