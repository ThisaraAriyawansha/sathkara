"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const CATEGORIES = ["dana", "pirith", "robe", "temple", "alms", "other"];

export default function AddDonationPage() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || !profile) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-slate py-20">...</p>
      </main>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("folder", "sathkara/donations");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) imageUrl = data.url;
      }

      const docRef = await addDoc(collection(db, "donations"), {
        authorId: user.uid,
        authorName: profile.name,
        authorPicUrl: profile.profilePicUrl || "",
        title,
        category,
        date,
        location,
        description,
        imageUrl,
        visibility,
        wellWishCount: 0,
        createdAt: serverTimestamp(),
      });

      router.push(`/donation/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setError(t("auth.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="pb-24 md:pb-0 min-h-screen">
      <Navbar />

      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-primary mb-8 text-center">
          {t("addDonation.title")}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-slate mb-1">{t("donation.title")}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-base"
            />
          </div>

          <div>
            <label className="block text-sm text-slate mb-1">{t("donation.category")}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-base"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-slate mb-1">{t("donation.date")}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[48px] px-4 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-base"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate mb-1">{t("donation.location")}</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full min-h-[48px] px-4 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate mb-1">{t("donation.description")}</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-base"
            />
          </div>

          <div>
            <label className="block text-sm text-slate mb-1">{t("donation.image")}</label>
            {imagePreview && (
              <img src={imagePreview} alt="" className="w-full h-40 object-cover rounded-card mb-2" />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
              className={`min-h-[44px] px-4 rounded-card border font-medium text-sm ${
                visibility === "public"
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-slate"
              }`}
            >
              {visibility === "public" ? t("donation.public") : t("donation.private")}
            </button>
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[48px] rounded-card bg-primary text-background font-medium disabled:opacity-60 mt-2"
          >
            {saving ? t("addDonation.saving") : t("addDonation.save")}
          </button>
        </form>
      </div>

      <BottomNav activePath="/add" />
    </main>
  );
}
