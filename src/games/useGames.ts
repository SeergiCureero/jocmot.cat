import { GAMES } from './registry';

/**
 * Els jocs que es mostren (portada, menú, capçalera, arxiu, estadístiques…).
 * Els jocs en proves (`editorsOnly`) no hi surten per a ningú, ni tan sols per als editors: només
 * s'hi pot entrar escrivint l'adreça (p. ex. /fondaria) amb un compte d'editor.
 */
export function useGames() {
  return GAMES;
}
