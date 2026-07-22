const DanaIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 11a8 8 0 0 0 16 0" />
    <path d="M3 11h18" />
    <path d="M12 3v4" />
    <path d="M9 5l1.5 2" />
    <path d="M15 5l-1.5 2" />
  </svg>
);

const PirithIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3a5 5 0 0 0-5 5c0 4-2 5-2 7h14c0-2-2-3-2-7a5 5 0 0 0-5-5Z" />
    <line x1="10" y1="19" x2="14" y2="19" />
  </svg>
);

const RobeIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 4 4 7v3h3v10h10V10h3V7l-4-3-3 2h-2L8 4Z" />
  </svg>
);

const TempleIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2l3 5H9l3-5Z" />
    <line x1="12" y1="7" x2="12" y2="10" />
    <rect x="6" y="10" width="12" height="9" rx="1" />
    <line x1="4" y1="19" x2="20" y2="19" />
  </svg>
);

const AlmsIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3c1 3 1 5 0 7-1-2-1-4 0-7Z" />
    <path d="M6 9c2 1 4 2 6 5-3 0-5-1-6-5Z" />
    <path d="M18 9c-2 1-4 2-6 5 3 0 5-1 6-5Z" />
    <path d="M12 21c-4 0-7-2-7-2s3-3 7-3 7 3 7 3-3 2-7 2Z" />
  </svg>
);

const OtherIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="8" width="18" height="13" rx="1" />
    <path d="M3 12h18" />
    <path d="M12 8v13" />
    <path d="M12 8c-1.5-4-6-4-6-1.5S9 8 12 8Z" />
    <path d="M12 8c1.5-4 6-4 6-1.5S15 8 12 8Z" />
  </svg>
);

export const WellWishIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2v20" />
    <path d="M12 4c-2 2-5 2-6 6 0 4 3 7 6 10" />
    <path d="M12 4c2 2 5 2 6 6 0 4-3 7-6 10" />
  </svg>
);

export const CalendarIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ICONS = {
  dana: DanaIcon,
  pirith: PirithIcon,
  robe: RobeIcon,
  temple: TempleIcon,
  alms: AlmsIcon,
  other: OtherIcon,
};

export default function CategoryIcon({ category, ...props }) {
  const Icon = ICONS[category] || OtherIcon;
  return <Icon {...props} />;
}
