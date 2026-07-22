"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import CategoryIcon, { WellWishIcon, CalendarIcon } from "@/components/CategoryIcons";
import { MapPinIcon } from "@/components/FormIcons";

export default function DonationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [donation, setDonation] = useState(null);
  const [author, setAuthor] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [message, setMessage] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadWishes = async (donationId) => {
    const q = query(collection(db, "donations", donationId, "wellWishes"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setWishes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "donations", id));
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        const data = { id: snap.id, ...snap.data() };
        setDonation(data);

        if (user) {
          try {
            const authorSnap = await getDoc(doc(db, "users", data.authorId));
            if (authorSnap.exists()) setAuthor(authorSnap.data());
          } catch (authorErr) {
            console.error(authorErr);
          }
        }

        try {
          await loadWishes(data.id);
        } catch (wishesErr) {
          console.error(wishesErr);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [id, user?.uid]);

  const handleQuickFill = () => setMessage(t("donation.wellWish"));

  const handlePostWish = async (e) => {
    e.preventDefault();
    if (!user || !message.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "donations", id, "wellWishes"), {
        authorId: user.uid,
        authorName: profile.name,
        authorPicUrl: profile.profilePicUrl || "",
        message: message.trim().slice(0, 200),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "donations", id), { wellWishCount: increment(1) });
      setMessage("");
      await loadWishes(id);
      setDonation((prev) => (prev ? { ...prev, wellWishCount: (prev.wellWishCount || 0) + 1 } : prev));
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-slate py-20">...</p>
      </main>
    );
  }

  if (notFound || !donation) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-slate py-20">{t("donation.notFound")}</p>
      </main>
    );
  }

  const authorAvatar =
    donation.authorPicUrl ||
    "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(donation.authorName || "?");

  return (
    <main className="pb-24 md:pb-0 min-h-screen">
      <Navbar />

      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-5 sm:pt-8">
        <div className="h-1.5 w-full max-w-[120px] mx-auto sm:mx-0 rounded-full bg-gradient-to-r from-accent via-primary/70 to-accent mb-4" />
      </div>

      {/* Full-bleed on mobile (90% of traffic) — contained and rounded from sm up */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 sm:max-w-2xl sm:mx-auto overflow-hidden bg-gradient-to-br from-primary/10 via-[#FAF8F5] to-accent/15 sm:rounded-3xl shadow-sm mb-3">
        {donation.imageUrl ? (
          <img src={donation.imageUrl} alt={donation.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute w-56 h-56 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-surface/80 border-2 border-accent/40 flex items-center justify-center shadow-sm">
              <CategoryIcon category={donation.category} className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/55 to-transparent" />
        <span className="absolute bottom-4 left-4 sm:left-4 flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-primary text-background font-semibold shadow-sm">
          <CategoryIcon category={donation.category} />
          {t(`categories.${donation.category}`)}
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-5 sm:px-6 pb-6 sm:pb-8">
        {donation.galleryUrls?.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 mb-6">
            {donation.galleryUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-24 h-24 shrink-0 object-cover rounded-2xl border border-border"
              />
            ))}
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-semibold text-charcoal leading-snug mt-1">{donation.title}</h1>
        <p className="flex flex-wrap items-center gap-1.5 text-[15px] sm:text-base text-slate mt-2.5">
          <CalendarIcon width={18} height={18} />
          {donation.date}
          {donation.location && (
            <>
              <span className="text-border">·</span>
              <MapPinIcon width={18} height={18} />
              {donation.location}
            </>
          )}
        </p>

        {donation.description && (
          <div className="mt-5 p-5 rounded-2xl border border-border/70 bg-surface">
            <p className="text-charcoal text-base sm:text-lg leading-relaxed whitespace-pre-wrap">{donation.description}</p>
          </div>
        )}

        <a
          href={`/user/${donation.authorId}`}
          className="flex items-center gap-3.5 mt-5 p-4 rounded-2xl border border-border/70 bg-surface hover:border-primary/30 transition"
        >
          <img src={authorAvatar} alt={donation.authorName} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/15" />
          <div>
            <p className="text-xs text-slate">{t("donation.sharedBy")}</p>
            <p className="text-base font-medium text-charcoal">{donation.authorName}</p>
            {author?.bio && <p className="text-sm text-slate line-clamp-1 mt-0.5">{author.bio}</p>}
          </div>
        </a>

        <div className="mt-10 sm:mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-primary mb-5">
            <WellWishIcon width={22} height={22} />
            {t("donation.wellWishesTitle")} ({wishes.length})
          </h2>

          {user ? (
            <form onSubmit={handlePostWish} className="flex flex-col gap-3 mb-8">
              <textarea
                rows={2}
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("donation.wellWishPlaceholder")}
                className="w-full px-4 py-3.5 rounded-2xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base transition resize-none"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="min-h-[44px] px-4 rounded-full border border-accent/50 bg-accent/10 text-primary font-semibold text-sm hover:bg-accent/20 transition"
                >
                  {t("donation.wellWish")}
                </button>
                <button
                  type="submit"
                  disabled={posting || !message.trim()}
                  className="ml-auto min-h-[48px] px-6 rounded-2xl bg-primary text-background font-medium text-base hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 transition"
                >
                  {posting ? t("addDonation.saving") : t("donation.postWellWish")}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-base text-slate mb-8">
              <a href="/login" className="text-primary font-medium">{t("nav.login")}</a> {t("donation.toWellWish")}
            </p>
          )}

          {wishes.length === 0 ? (
            <p className="text-slate text-base">{t("donation.noWellWishes")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {wishes.map((wish) => {
                const avatar =
                  wish.authorPicUrl ||
                  "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(wish.authorName || "?");
                return (
                  <li key={wish.id} className="flex gap-3.5 p-4 rounded-2xl border border-border/60 bg-primary/[0.03]">
                    <img src={avatar} alt={wish.authorName} className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-background" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">{wish.authorName}</p>
                      <p className="text-base text-charcoal/90 mt-0.5">{wish.message}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <BottomNav activePath="/" />
    </main>
  );
}
