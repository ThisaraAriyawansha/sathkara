"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import DonationCard from "@/components/DonationCard";

export default function PublicProfilePage() {
  const { uid } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        setProfile(snap.data());

        const q = query(
          collection(db, "donations"),
          where("authorId", "==", uid),
          where("visibility", "==", "public"),
          orderBy("createdAt", "desc")
        );
        const donationsSnap = await getDocs(q);
        setDonations(donationsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [uid]);

  if (pageLoading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-slate py-20">...</p>
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-slate py-20">{t("profile.notFound")}</p>
      </main>
    );
  }

  const isSelf = user && user.uid === uid;

  return (
    <main className="pb-24 md:pb-0 min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <img
            src={profile.profilePicUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(profile.name)}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-border"
          />
          <h1 className="text-xl font-semibold mt-4">{profile.name}</h1>
          {profile.bio && <p className="text-charcoal text-sm mt-3 max-w-md">{profile.bio}</p>}

          {isSelf && (
            <a href="/profile" className="text-primary text-sm font-medium mt-4">
              {t("profile.thisIsYou")}
            </a>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-primary mb-4">{t("profile.donationsBy")}</h2>
          {donations.length === 0 ? (
            <p className="text-slate text-sm">{t("profile.noDonations")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {donations.map((donation) => (
                <DonationCard key={donation.id} donation={donation} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav activePath="/" />
    </main>
  );
}
