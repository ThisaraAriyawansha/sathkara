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

  return (
    <main className="pb-24 md:pb-0">
      <Navbar />

      <section className="relative overflow-hidden text-center px-6 py-24 md:py-36 min-h-[440px] md:min-h-[560px] flex items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1742281998849-d896b771865d?fm=jpg&q=80&w=2000&auto=format&fit=crop"
          alt="Gangaramaya Buddhist temple, Sri Lanka"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/50 to-charcoal/75" />

        <div className="relative max-w-3xl mx-auto">
          <h1 className="animate-fade-in-up text-4xl sm:text-5xl md:text-6xl font-semibold text-background mb-3 tracking-wide">
            සත්කාර
          </h1>
          <p
            className="animate-fade-in-up text-lg sm:text-xl md:text-2xl font-medium text-accent mb-4 leading-snug"
            style={{ animationDelay: "0.12s" }}
          >
            {t("home.tagline")}
          </p>
          <p
            className="animate-fade-in-up text-background/90 text-base md:text-lg"
            style={{ animationDelay: "0.24s" }}
          >
            {t("home.subtitle")}
          </p>

          <div
            className="animate-fade-in-up flex items-center justify-center gap-3 mt-8"
            style={{ animationDelay: "0.36s" }}
          >
            <a
              href={user ? "/add" : "/login"}
              className="min-h-[48px] px-6 flex items-center rounded-card bg-primary text-background font-medium text-sm md:text-base shadow-lg"
            >
              {t("home.cta")}
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-16">
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
