"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import {
  MapPinIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@/components/FormIcons";

const ZOOM_SCALE = 2.5;

function ImageLightbox({ images, index, onClose, onIndexChange }) {
  const { t } = useLanguage();
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ dragging: false, moved: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const goTo = useCallback(
    (next) => {
      setZoomed(false);
      setPos({ x: 0, y: 0 });
      onIndexChange(((next % images.length) + images.length) % images.length);
    },
    [images.length, onIndexChange]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && images.length > 1) goTo(index + 1);
      else if (e.key === "ArrowLeft" && images.length > 1) goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goTo, index, images.length]);

  const toggleZoom = () => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    if (zoomed) {
      setZoomed(false);
      setPos({ x: 0, y: 0 });
    } else {
      setZoomed(true);
    }
  };

  const handlePointerDown = (e) => {
    if (!zoomed) return;
    dragRef.current.dragging = true;
    dragRef.current.moved = false;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.baseX = pos.x;
    dragRef.current.baseY = pos.y;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
    setPos({ x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy });
  };

  const handlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col animate-[fadeIn_0.15s_ease-out]">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-background shrink-0">
        <span className="text-sm font-medium tabular-nums opacity-80">
          {images.length > 1 ? `${index + 1} / ${images.length}` : ""}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (zoomed) {
                setZoomed(false);
                setPos({ x: 0, y: 0 });
              } else {
                setZoomed(true);
              }
            }}
            className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition"
            aria-label={t("donation.tapToZoom")}
          >
            {zoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition"
            aria-label="Close"
          >
            <XIcon width={18} height={18} className="text-background" />
          </button>
        </div>
      </div>

      <div
        className="relative flex-1 overflow-hidden touch-none select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(index - 1);
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition text-background"
              aria-label="Previous"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(index + 1);
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition text-background"
              aria-label="Next"
            >
              <ChevronRightIcon />
            </button>
          </>
        )}

        <div className="w-full h-full flex items-center justify-center">
          <img
            src={images[index]}
            alt=""
            draggable={false}
            onClick={toggleZoom}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="max-w-full max-h-full object-contain transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${zoomed ? ZOOM_SCALE : 1}) translate(${pos.x / (zoomed ? ZOOM_SCALE : 1)}px, ${pos.y / (zoomed ? ZOOM_SCALE : 1)}px)`,
              cursor: zoomed ? (dragRef.current.dragging ? "grabbing" : "grab") : "zoom-in",
            }}
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 sm:px-6 py-3 shrink-0">
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`w-14 h-14 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                i === index ? "border-background" : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [lightboxIndex, setLightboxIndex] = useState(null);

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

  const images = [donation.imageUrl, ...(donation.galleryUrls || [])].filter(Boolean);

  const cardClass = "bg-surface rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.08)] border border-border/60";

  return (
    <main className="pb-24 md:pb-0 min-h-screen bg-[#F6F7F5]">
      <Navbar />

      {/* Full-bleed on mobile (90% of traffic) — contained and rounded from sm up */}
      <div className="relative w-full h-72 sm:h-96 md:h-[28rem] sm:max-w-3xl sm:mx-auto sm:mt-6 overflow-hidden bg-gradient-to-br from-primary/10 via-[#FAF8F5] to-accent/15 sm:rounded-2xl shadow-sm group">
        {donation.imageUrl ? (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="w-full h-full block cursor-zoom-in"
            aria-label={t("donation.tapToZoom")}
          >
            <img
              src={donation.imageUrl}
              alt={donation.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </button>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute w-56 h-56 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-surface/80 border-2 border-accent/40 flex items-center justify-center shadow-sm">
              <CategoryIcon category={donation.category} className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
            </div>
          </div>
        )}
        {donation.imageUrl && (
          <span className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-charcoal/45 text-background backdrop-blur-sm pointer-events-none opacity-0 sm:group-hover:opacity-100 transition">
            <ZoomInIcon width={16} height={16} />
          </span>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-10 flex flex-col gap-4 sm:gap-5">
        {donation.galleryUrls?.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto -mx-1 px-1">
            {donation.galleryUrls.map((url, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setLightboxIndex(i + 1)}
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden shadow-sm cursor-zoom-in transition hover:opacity-90"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary mb-2">
            <CategoryIcon category={donation.category} width={16} height={16} />
            {t(`categories.${donation.category}`)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-charcoal leading-snug">{donation.title}</h1>
          <p className="flex flex-wrap items-center gap-1.5 text-sm sm:text-[15px] text-slate mt-2">
            <CalendarIcon width={16} height={16} />
            {donation.date}
            {donation.location && (
              <>
                <span className="text-border">·</span>
                <MapPinIcon width={16} height={16} />
                {donation.location}
              </>
            )}
          </p>

          {donation.description && (
            <p className="text-charcoal/90 text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap mt-4 pt-4 border-t border-border/60">
              {donation.description}
            </p>
          )}
        </div>

        <a
          href={`/user/${donation.authorId}`}
          className={`${cardClass} flex items-center gap-3.5 p-4 sm:p-5 hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition`}
        >
          <img src={authorAvatar} alt={donation.authorName} className="w-12 h-12 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="text-xs text-slate">{t("donation.sharedBy")}</p>
            <p className="text-base font-medium text-charcoal truncate">{donation.authorName}</p>
            {author?.bio && <p className="text-sm text-slate line-clamp-1 mt-0.5">{author.bio}</p>}
          </div>
        </a>

        <div className={`${cardClass} p-5 sm:p-6`}>
          <h2 className="flex items-center gap-2 text-lg font-medium text-charcoal mb-4">
            <WellWishIcon width={20} height={20} className="text-primary" />
            {t("donation.wellWishesTitle")} ({wishes.length})
          </h2>

          {user ? (
            <form onSubmit={handlePostWish} className="flex flex-col gap-3 mb-5 pb-5 border-b border-border/60">
              <textarea
                rows={2}
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("donation.wellWishPlaceholder")}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-[15px] transition resize-none"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="min-h-[40px] px-4 rounded-full border border-border text-slate font-medium text-sm hover:border-primary/40 hover:text-primary transition"
                >
                  {t("donation.wellWish")}
                </button>
                <button
                  type="submit"
                  disabled={posting || !message.trim()}
                  className="ml-auto min-h-[40px] px-5 rounded-full bg-primary text-background font-medium text-sm hover:bg-primary/90 active:scale-[0.99] disabled:opacity-60 transition"
                >
                  {posting ? t("addDonation.saving") : t("donation.postWellWish")}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-[15px] text-slate mb-5 pb-5 border-b border-border/60">
              <a href="/login" className="text-primary font-medium">{t("nav.login")}</a> {t("donation.toWellWish")}
            </p>
          )}

          {wishes.length === 0 ? (
            <p className="text-slate text-[15px]">{t("donation.noWellWishes")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/60">
              {wishes.map((wish) => {
                const avatar =
                  wish.authorPicUrl ||
                  "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(wish.authorName || "?");
                return (
                  <li key={wish.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                    <img src={avatar} alt={wish.authorName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-charcoal">{wish.authorName}</p>
                      <p className="text-[15px] text-charcoal/90 mt-0.5">{wish.message}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <BottomNav activePath="/" />

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </main>
  );
}
