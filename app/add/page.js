"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { ImageIcon, PlusIcon, XIcon, MapPinIcon, TagIcon, AlignLeftIcon, TypeIcon } from "@/components/FormIcons";

const CATEGORIES = ["dana", "pirith", "robe", "temple", "alms", "other"];
const MAX_GALLERY = 6;

let galleryIdCounter = 0;

export default function AddDonationPage() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const galleryInputRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      galleryImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !user || !profile) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-slate py-20">...</p>
      </main>
    );
  }

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const removeMainImage = () => {
    if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
    setMainImageFile(null);
    setMainImagePreview(null);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_GALLERY - galleryImages.length);
    const next = files.map((file) => ({
      id: ++galleryIdCounter,
      file,
      preview: URL.createObjectURL(file),
    }));
    setGalleryImages((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeGalleryImage = (id) => {
    setGalleryImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((img) => img.id !== id);
    });
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "sathkara/donations");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.success ? data.url : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const imageUrl = mainImageFile ? await uploadImage(mainImageFile) : "";
      const galleryUrls = (
        await Promise.all(galleryImages.map((img) => uploadImage(img.file)))
      ).filter(Boolean);

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
        galleryUrls,
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
    <main className="pb-24 md:pb-16 min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 md:py-12">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-semibold text-charcoal">{t("addDonation.title")}</h1>
          <p className="text-slate text-sm mt-2">{t("addDonation.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Photos */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate">
              {t("addDonation.photosSection")}
            </h2>

            <div>
              <input
                id="main-photo-input"
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="hidden"
              />
              {mainImagePreview ? (
                <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-border">
                  <img src={mainImagePreview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    aria-label="Remove photo"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-charcoal/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-charcoal/80 transition"
                  >
                    <XIcon />
                  </button>
                  <label
                    htmlFor="main-photo-input"
                    className="absolute inset-x-0 bottom-0 py-2.5 text-center text-sm font-medium text-white bg-gradient-to-t from-charcoal/70 to-transparent cursor-pointer"
                  >
                    {t("donation.changePhoto")}
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="main-photo-input"
                  className="flex flex-col items-center justify-center gap-2 h-48 sm:h-56 rounded-2xl border-2 border-dashed border-border text-slate hover:border-primary hover:text-primary hover:bg-primary/5 transition cursor-pointer"
                >
                  <ImageIcon />
                  <span className="text-sm font-medium">{t("donation.tapToAddPhoto")}</span>
                </label>
              )}
              <p className="text-xs text-slate mt-2">{t("donation.mainPhotoHint")}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-charcoal mb-1">{t("donation.gallery")}</p>
              <p className="text-xs text-slate mb-3">{t("donation.galleryHint")}</p>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                className="hidden"
              />
              <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryImages.map((img) => (
                  <div key={img.id} className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-border">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(img.id)}
                      aria-label="Remove photo"
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-charcoal/60 text-white flex items-center justify-center hover:bg-charcoal/80 transition"
                    >
                      <XIcon width={10} height={10} />
                    </button>
                  </div>
                ))}

                {galleryImages.length < MAX_GALLERY && (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-slate hover:border-primary hover:text-primary hover:bg-primary/5 transition"
                  >
                    <PlusIcon />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate">
              {t("addDonation.detailsSection")}
            </h2>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">{t("donation.title")}</label>
              <div className="relative">
                <TypeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
                <input
                  type="text"
                  required
                  placeholder={t("donation.titlePlaceholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full min-h-[52px] pl-11 pr-4 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">{t("donation.category")}</label>
              <div className="relative">
                <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-h-[52px] pl-11 pr-4 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base transition appearance-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`categories.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">{t("donation.date")}</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-h-[52px] px-4 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">{t("donation.location")}</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
                  <input
                    type="text"
                    placeholder={t("donation.locationPlaceholder")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full min-h-[52px] pl-11 pr-4 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">{t("donation.description")}</label>
              <div className="relative">
                <AlignLeftIcon className="absolute left-4 top-3.5 text-slate" />
                <textarea
                  rows={4}
                  placeholder={t("donation.descriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base transition resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`min-h-[48px] rounded-2xl border font-medium text-sm transition ${
                  visibility === "public"
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-slate"
                }`}
              >
                {t("donation.public")}
              </button>
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`min-h-[48px] rounded-2xl border font-medium text-sm transition ${
                  visibility === "private"
                    ? "border-primary text-primary bg-primary/10"
                    : "border-border text-slate"
                }`}
              >
                {t("donation.private")}
              </button>
            </div>
          </section>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[52px] rounded-2xl bg-primary text-background font-medium shadow-sm hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 transition"
          >
            {saving ? t("addDonation.saving") : t("addDonation.save")}
          </button>
        </form>
      </div>

      <BottomNav activePath="/add" />
    </main>
  );
}
