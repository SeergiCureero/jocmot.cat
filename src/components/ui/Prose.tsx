import type { ReactNode } from 'react';

/** Estils per a pàgines de text llarg (sobre, legal). */
export default function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="[&_a]:text-brand-700 space-y-4 leading-relaxed text-stone-700 [&_a]:font-semibold [&_a:hover]:underline [&_h2]:mt-10 [&_h2]:scroll-mt-20 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-stone-900 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-stone-900 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-stone-900 [&_ul]:space-y-1">
      {children}
    </div>
  );
}
