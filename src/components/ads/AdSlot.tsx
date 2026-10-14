import { ADS, type AdSlotId } from '@/config/ads';
import { cn } from '@/lib/cn';

interface Props {
  id: AdSlotId;
  className?: string;
}

/**
 * Espai publicitari. Mentre `ADS.enabled` sigui false no renderitza res.
 * Per activar AdSense: posar `provider: 'adsense'`, `clientId` i `providerSlot`
 * a config/ads.ts i carregar el script del proveïdor (veure docs/ANUNCIS.md).
 */
export default function AdSlot({ id, className }: Props) {
  if (!ADS.enabled) return null;
  const slot = ADS.slots[id];

  if (ADS.provider === 'placeholder') {
    return (
      <div
        className={cn('grid place-items-center rounded-lg border border-dashed border-stone-300 bg-stone-100 text-xs text-stone-400', className)}
        style={{ minHeight: slot.minHeight }}
      >
        Anunci · {id}
      </div>
    );
  }

  return (
    <div className={className} style={{ minHeight: slot.minHeight }}>
      <ins
        className="adsbygoogle block"
        data-ad-client={ADS.clientId}
        data-ad-slot={slot.providerSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
