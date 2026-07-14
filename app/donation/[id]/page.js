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

        const authorSnap = await getDoc(doc(db, "users", data.authorId));
        if (authorSnap.exists()) setAuthor(authorSnap.data());

        await loadWishes(data.id);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [id]);

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

      <div className="max-w-2xl mx-auto px-6 py-8">
        {donation.imageUrl && (
          <img src={donation.imageUrl} alt={donation.title} className="w-full h-56 object-cover rounded-card mb-5" />
        )}

        <span className="inline-block text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium mb-2">
          {t(`categories.${donation.category}`)}
        </span>
        <h1 className="text-2xl font-semibold text-charcoal leading-snug">{donation.title}</h1>
        <p className="text-sm text-slate mt-1">
          {donation.date}
          {donation.location ? ` · ${donation.location}` : ""}
        </p>
        {donation.description && (
          <p className="text-charcoal text-base mt-4 whitespace-pre-wrap">{donation.description}</p>
        )}

        <a
          href={`/user/${donation.authorId}`}
          className="flex items-center gap-3 mt-6 p-3 rounded-card border border-border bg-surface"
        >
          <img src={authorAvatar} alt={donation.authorName} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-medium text-charcoal">{donation.authorName}</p>
            {author?.bio && <p className="text-xs text-slate line-clamp-1">{author.bio}</p>}
          </div>
        </a>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-primary mb-4">
            {t("donation.wellWishesTitle")} ({wishes.length})
          </h2>

          {user ? (
            <form onSubmit={handlePostWish} className="flex flex-col gap-2 mb-6">
              <textarea
                rows={2}
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("donation.wellWishPlaceholder")}
                className="w-full px-4 py-3 rounded-card border border-border bg-surface focus:outline-none focus:border-primary text-sm"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-xs px-3 py-2 rounded-full border border-border text-slate hover:border-primary hover:text-primary transition"
                >
                  {t("donation.wellWish")}
                </button>
                <button
                  type="submit"
                  disabled={posting || !message.trim()}
                  className="ml-auto min-h-[40px] px-5 rounded-card bg-primary text-background font-medium text-sm disabled:opacity-60"
                >
                  {posting ? t("addDonation.saving") : t("donation.postWellWish")}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate mb-6">
              <a href="/login" className="text-primary font-medium">{t("nav.login")}</a> {t("donation.toWellWish")}
            </p>
          )}

          {wishes.length === 0 ? (
            <p className="text-slate text-sm">{t("donation.noWellWishes")}</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {wishes.map((wish) => {
                const avatar =
                  wish.authorPicUrl ||
                  "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(wish.authorName || "?");
                return (
                  <li key={wish.id} className="flex gap-3">
                    <img src={avatar} alt={wish.authorName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">{wish.authorName}</p>
                      <p className="text-sm text-slate">{wish.message}</p>
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
