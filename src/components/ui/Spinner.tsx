export default function Spinner() {
  return (
    <div className="grid min-h-[40vh] place-items-center" role="status" aria-label="Carregant">
      <div className="size-8 animate-spin rounded-full border-4 border-stone-200 border-t-brand-700" />
    </div>
  );
}
