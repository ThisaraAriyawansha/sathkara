"use client";

import { useLanguage } from "@/context/LanguageContext";
import CategoryIcon, { WellWishIcon, CalendarIcon } from "@/components/CategoryIcons";
import { MapPinIcon } from "@/components/FormIcons";

export default function DonationCard({ donation }) {
  const { t } = useLanguage();

  const authorAvatar =
    donation.authorPicUrl ||
    "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(donation.authorName || "?");

  const extraPhotos = donation.galleryUrls?.length || 0;

  return (
    <div className="rounded-3xl border border-border/70 bg-surface overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <div className="h-1.5 w-full bg-gradient-to-r from-accent via-primary/70 to-accent" />

      <a href={`/donation/${donation.id}`} className="block">
        <div className="relative h-48 sm:h-52 bg-gradient-to-br from-primary/10 via-[#FAF8F5] to-accent/15">
          {donation.imageUrl ? (
            <img
              src={donation.imageUrl}
              alt={donation.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute w-36 h-36 rounded-full bg-accent/15 blur-2xl" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface/80 border-2 border-accent/40 flex items-center justify-center shadow-sm">
                <CategoryIcon category={donation.category} className="w-9 h-9 sm:w-11 sm:h-11 text-primary" />
              </div>
            </div>
          )}

          <span className="absolute top-3 left-3 flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-primary text-background font-semibold shadow-sm">
            <CategoryIcon category={donation.category} />
            {t(`categories.${donation.category}`)}
          </span>

          {extraPhotos > 0 && (
            <span className="absolute top-3 right-3 text-xs px-2.5 py-1.5 rounded-full bg-charcoal/60 backdrop-blur-sm text-white font-medium">
              +{extraPhotos}
            </span>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg sm:text-xl font-semibold text-charcoal leading-snug">{donation.title}</h3>
          {donation.description && (
            <p className="text-[15px] sm:text-base text-slate mt-1.5 leading-relaxed line-clamp-2">{donation.description}</p>
          )}
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-slate mt-3">
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
        </div>
      </a>

      <div className="px-5 pb-5 pt-4 border-t border-border/70 flex items-center justify-between">
        <a href={`/user/${donation.authorId}`} className="flex items-center gap-2.5 min-h-[40px]">
          <img src={authorAvatar} alt={donation.authorName} className="w-9 h-9 rounded-full object-cover ring-2 ring-background" />
          <span className="text-sm sm:text-[15px] text-charcoal font-medium">{donation.authorName}</span>
        </a>
        <span className="flex items-center gap-1.5 text-sm text-primary font-semibold bg-accent/15 px-3 py-1.5 rounded-full">
          <WellWishIcon width={16} height={16} />
          {donation.wellWishCount || 0}
        </span>
      </div>
    </div>
  );
}
