// Small hand-rolled icon set (kept minimal to avoid an extra dependency).
type IconProps = { className?: string };

const base = "stroke-current fill-none";

export const PlusIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const TrashIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);

export const CopyIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M4 16V6a2 2 0 0 1 2-2h10" />
  </svg>
);

export const PencilIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

export const BarChartIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </svg>
);

export const SettingsIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const DragHandleIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-current ${className}`}>
    <circle cx="8" cy="6" r="1.4" /><circle cx="16" cy="6" r="1.4" />
    <circle cx="8" cy="12" r="1.4" /><circle cx="16" cy="12" r="1.4" />
    <circle cx="8" cy="18" r="1.4" /><circle cx="16" cy="18" r="1.4" />
  </svg>
);

export const CheckIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const XIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const ArrowLeftIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const ChevronDownIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const LinkIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`${base} ${className}`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const KebabIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-current ${className}`}>
    <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
  </svg>
);

export const StarIcon = ({ className = "w-6 h-6", filled = false }: IconProps & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={`${filled ? "fill-current" : "fill-none"} stroke-current ${className}`} strokeWidth={1.5} strokeLinejoin="round">
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
