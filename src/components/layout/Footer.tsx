import { SITE } from '@/config/site';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-stone-200 py-6 text-center text-xs text-stone-500">
      © {new Date().getFullYear()} {SITE.name} · {SITE.tagline}
    </footer>
  );
}
