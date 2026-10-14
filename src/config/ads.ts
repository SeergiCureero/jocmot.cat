/**
 * Configuració d'anuncis. De moment desactivats.
 * Els espais (slots) ja estan col·locats al layout perquè, quan s'activin,
 * no es mogui el contingut (reservem l'alçada).
 */
export type AdSlotId = 'home-top' | 'home-bottom' | 'game-bottom' | 'sidebar';

export interface AdSlotConfig {
  /** Alçada mínima reservada (px) per evitar salts de layout. */
  minHeight: number;
  /** Identificador al proveïdor (p. ex. data-ad-slot d'AdSense). */
  providerSlot?: string;
}

export const ADS = {
  enabled: false,
  /** 'placeholder' mostra caixes grises per maquetar; 'adsense' per producció. */
  provider: 'placeholder' as 'placeholder' | 'adsense',
  clientId: '',
  slots: {
    'home-top': { minHeight: 90 },
    'home-bottom': { minHeight: 250 },
    'game-bottom': { minHeight: 100 },
    sidebar: { minHeight: 600 },
  } as Record<AdSlotId, AdSlotConfig>,
};
