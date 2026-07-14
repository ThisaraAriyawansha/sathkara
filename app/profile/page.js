"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import DonationCard from "@/components/DonationCard";

export default function ProfilePage() {
  const { user, profile, loading, logout, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [myDonations, setMyDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) setBio(profile.bio || "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const q = query(
          collection(db, "donations"),
          where("authorId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setMyDonations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setDonationsLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading || !user || !profile) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-slate py-20">...</p>
      </main>
    );
  }

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicFile(file);
      setPicPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let profilePicUrl = profile.profilePicUrl;

      if (picFile) {
        const formData = new FormData();
        formData.append("file", picFile);
        formData.append("folder", "sathkara/profiles");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) profilePicUrl = data.url;
      }

      await updateDoc(doc(db, "users", user.uid), { bio, profilePicUrl });
      await refreshProfile();
      setEditing(false);
      setPicFile(null);
      setPicPreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="pb-24 md:pb-0 min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={picPreview || profile.profilePicUrl || "https://api.dicebear.com/7.x/initials/svg?seed=" + profile.name}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-border"
            />
            {editing && (
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer text-background text-sm">
                +
                <input type="file" accept="image/*" onChange={handlePicChange} className="hidden" />
              </label>
            )}
          </div>

          <h1 className="text-xl font-semibold mt-4">{profile.name}</h1>
          <p className="text-slate text-sm">{profile.email}</p>

          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("profile.bioPlaceholder")}
              rows={3}
              className="w-full mt-4 px-4 py-3 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-sm"
            />
          ) : (
            <p className="text-charcoal text-sm mt-4 max-w-md">
              {profile.bio || t("profile.bioPlaceholder")}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            {editing ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="min-h-[44px] px-6 rounded-card bg-primary text-background font-medium disabled:opacity-60"
              >
                {saving ? t("profile.saving") : t("profile.save")}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="min-h-[44px] px-6 rounded-card border border-border font-medium"
              >
                {t("profile.editProfile")}
              </button>
            )}

            <button
              onClick={logout}
              className="min-h-[44px] px-6 rounded-card border border-border text-error font-medium"
            >
              {t("nav.logout")}
            </button>
          </div>

          {profile.role === "admin" && (
            <a href="/admin" className="text-primary text-sm font-medium mt-4 md:hidden">
              {t("nav.admin")}
            </a>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-primary mb-4">{t("profile.myDonations")}</h2>
          {donationsLoading ? (
            <p className="text-slate text-sm">...</p>
          ) : myDonations.length === 0 ? (
            <p className="text-slate text-sm">{t("profile.noDonations")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myDonations.map((donation) => (
                <DonationCard key={donation.id} donation={donation} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav activePath="/profile" />
    </main>
  );
}
