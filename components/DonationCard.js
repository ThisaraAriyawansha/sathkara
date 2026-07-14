"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function DonationCard({ donation }) {
  const { t } = useLanguage();

  const authorAvatar =
    donation.authorPicUrl ||
    "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(donation.authorName || "?");

  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden flex flex-col hover:border-primary/50 transition">
      <a href={`/donation/${donation.id}`} className="block">
        {donation.imageUrl && (
          <img
            src={donation.imageUrl}
            alt={donation.title}
            className="w-full h-40 object-cover"
          />
        )}
        <div className="p-4">
          <span className="inline-block text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium mb-2">
            {t(`categories.${donation.category}`)}
          </span>
          <h3 className="text-base font-semibold text-charcoal leading-snug">{donation.title}</h3>
          {donation.description && (
            <p className="text-sm text-slate mt-1 line-clamp-2">{donation.description}</p>
          )}
          <p className="text-xs text-slate mt-2">
            {donation.date}
            {donation.location ? ` · ${donation.location}` : ""}
          </p>
        </div>
      </a>

      <div className="px-4 pb-4 pt-3 border-t border-border flex items-center justify-between">
        <a href={`/user/${donation.authorId}`} className="flex items-center gap-2 min-h-[32px]">
          <img src={authorAvatar} alt={donation.authorName} className="w-6 h-6 rounded-full object-cover" />
          <span className="text-xs text-charcoal font-medium">{donation.authorName}</span>
        </a>
        <span className="text-xs text-slate">
          {donation.wellWishCount || 0} {t("donation.wellWishShort")}
        </span>
      </div>
    </div>
  );
}
