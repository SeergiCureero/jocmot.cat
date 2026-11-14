import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Icones de colors de la interfície: gairebé emojis, però dibuixades per nosaltres (iguals a tots els
 * dispositius). Són decoratives: el text sempre va al costat. Colors de la paleta de docs/DISSENY.md.
 */
const ICONS = {
  trophy: (
    <>
      <path
        d="M7 4h10v5.5a5 5 0 0 1-10 0V4Z"
        fill="#fbbf24"
        stroke="#b45309"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7 6H4.2v1.2A3.3 3.3 0 0 0 7.5 10.5M17 6h2.8v1.2a3.3 3.3 0 0 1-3.3 3.3"
        fill="none"
        stroke="#b45309"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M12 14.5V18" stroke="#b45309" strokeWidth="1.8" />
      <rect x="7.5" y="18" width="9" height="3" rx="1" fill="#92400e" />
      <path d="M9.5 6.2v3.2" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  chart: (
    <>
      <rect x="3.5" y="12" width="4.5" height="8.5" rx="1.2" fill="#0f766e" />
      <rect x="9.75" y="4" width="4.5" height="16.5" rx="1.2" fill="#9333ea" />
      <rect x="16" y="8.5" width="4.5" height="12" rx="1.2" fill="#0284c7" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" fill="#0284c7" />
      <path
        d="M7 6.5c1.5-.3 3 .2 3.2 1.4.2 1.3-1.3 1.6-1.4 2.7-.1 1.2 1.2 1.6.7 2.8-.5 1.1-2.1.7-3-.4C5.2 11.4 5 8.2 7 6.5ZM13.5 14c1.3-.5 3-.2 3.7.8.8 1.1.2 2.6-.8 3.2-1.2.7-2.6.1-3.1-1-.5-1.1-.9-2.4.2-3Z"
        fill="#4ade80"
      />
      <path d="M14 4.6c1.5.2 3 1.2 3.9 2.6-1 .8-2.7.9-3.4-.2-.5-.8-.6-1.7-.5-2.4Z" fill="#4ade80" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#075985" strokeWidth="1.2" />
    </>
  ),
  friends: (
    <>
      <circle cx="8.5" cy="8" r="3.3" fill="#9333ea" />
      <path d="M2.5 19.5c0-3.4 2.7-5.7 6-5.7s6 2.3 6 5.7v.5h-12v-.5Z" fill="#9333ea" />
      <circle cx="16.5" cy="9" r="2.9" fill="#0f766e" />
      <path
        d="M13.6 14.4c.9-.4 1.8-.6 2.9-.6 2.8 0 5 1.9 5 4.8v1.4h-5.6c.2-2.1-.4-4-2.3-5.6Z"
        fill="#0f766e"
      />
    </>
  ),
  chat: (
    <>
      <path
        d="M5 4.5h14a2.5 2.5 0 0 1 2.5 2.5v7.5a2.5 2.5 0 0 1-2.5 2.5h-7l-4.5 3.5V17H5a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 5 4.5Z"
        fill="#0284c7"
      />
      <circle cx="8" cy="10.8" r="1.3" fill="#fff" />
      <circle cx="12" cy="10.8" r="1.3" fill="#fff" />
      <circle cx="16" cy="10.8" r="1.3" fill="#fff" />
    </>
  ),
  fire: (
    <>
      <path
        d="M12.5 2.5c.6 3-1.8 4.3-3.2 6.2C8 10.4 7 12 7 14.3A5.3 5.3 0 0 0 12.3 20 5.4 5.4 0 0 0 18 14.6c0-2.2-1-3.7-2.2-5-.4 1-1 1.7-1.7 2 .3-3.4-.4-6.8-1.6-9.1Z"
        fill="#ea580c"
      />
      <path
        d="M12.4 20a3.2 3.2 0 0 1-3.2-3.2c0-1.9 1.4-2.8 2.2-4.2.5 1 1.2 1.3 1.9 1.1.2.7.9 1.5.9 2.4 0 2-.7 3.9-1.8 3.9Z"
        fill="#fbbf24"
      />
    </>
  ),
  bulb: (
    <>
      <path
        d="M12 2.8a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.2 1.1 2h5c0-.8.4-1.4 1.1-2A6 6 0 0 0 12 2.8Z"
        fill="#fbbf24"
        stroke="#b45309"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <rect x="9.5" y="17" width="5" height="1.8" rx=".9" fill="#78716c" />
      <rect x="10.3" y="19.6" width="3.4" height="1.6" rx=".8" fill="#78716c" />
    </>
  ),
  calendar: (
    <>
      <rect
        x="3"
        y="4.5"
        width="18"
        height="16"
        rx="3"
        fill="#fff"
        stroke="#78716c"
        strokeWidth="1.4"
      />
      <path d="M3 9.5V7.5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3Z" fill="#dc2626" />
      <rect x="7" y="2.6" width="2" height="4" rx="1" fill="#7f1d1d" />
      <rect x="15" y="2.6" width="2" height="4" rx="1" fill="#7f1d1d" />
      <circle cx="8" cy="13.5" r="1.2" fill="#0f766e" />
      <circle cx="12" cy="13.5" r="1.2" fill="#9333ea" />
      <circle cx="16" cy="13.5" r="1.2" fill="#0284c7" />
      <circle cx="8" cy="17" r="1.2" fill="#b45309" />
      <circle cx="12" cy="17" r="1.2" fill="#15803d" />
    </>
  ),
  pencil: (
    <>
      <path
        d="M4 20l1-4.5L16.5 4a2.1 2.1 0 0 1 3 0l.5.5a2.1 2.1 0 0 1 0 3L8.5 19 4 20Z"
        fill="#fbbf24"
      />
      <path
        d="M16.5 4a2.1 2.1 0 0 1 3 0l.5.5a2.1 2.1 0 0 1 0 3l-1.7 1.7-3.5-3.5L16.5 4Z"
        fill="#ec4899"
      />
      <path d="M4 20l1-4.5 3.5 3.5L4 20Z" fill="#44403c" />
    </>
  ),
  heart: (
    <path
      d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.3 0 5.6 3.1 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z"
      fill="#e11d48"
    />
  ),
  coffee: (
    <>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" fill="#b45309" />
      <path
        d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H15.5"
        fill="none"
        stroke="#b45309"
        strokeWidth="1.8"
      />
      <path
        d="M8 3.5c-.8 1 .8 1.8 0 3M12 3.5c-.8 1 .8 1.8 0 3"
        fill="none"
        stroke="#78716c"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect x="3" y="19.5" width="14" height="1.6" rx=".8" fill="#92400e" />
    </>
  ),
  rocket: (
    <>
      <path
        d="M12 2.5c3.5 2 5 6 4 10.5H8c-1-4.5.5-8.5 4-10.5Z"
        fill="#e7e5e4"
        stroke="#78716c"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="1.9" fill="#0284c7" />
      <path d="M8 11.5 5 15l3.5-.5M16 11.5l3 3.5-3.5-.5" fill="#dc2626" />
      <path d="M10 14.5h4l-2 5.5-2-5.5Z" fill="#fbbf24" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type ColorIconName = keyof typeof ICONS;

export function ColorIcon({
  name,
  size = 24,
  className,
}: {
  name: ColorIconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={cn('shrink-0', className)}
    >
      {ICONS[name]}
    </svg>
  );
}
