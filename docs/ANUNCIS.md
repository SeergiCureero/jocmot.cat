# Anuncis

Els espais ja són al layout (`<AdSlot id="…">`): `home-top`, `home-bottom`, `game-bottom` i `sidebar`. Amb `ADS.enabled = false` no es renderitza res.

## Activar-los

1. **Maquetar:** a `src/config/ads.ts`, `enabled: true` i `provider: 'placeholder'` per veure caixes grises.
2. **Producció (AdSense o similar):**
   - `provider: 'adsense'`, `clientId` i `providerSlot` de cada espai.
   - Afegir el script del proveïdor a `index.html` i cridar `adsbygoogle.push({})` en muntar l'`AdSlot`.
   - **Obligatori a la UE:** una plataforma de consentiment de galetes (CMP) certificada abans de carregar anuncis personalitzats.

Cada espai reserva una alçada mínima (`minHeight`) per evitar salts de contingut.
