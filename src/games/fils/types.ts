/** [fila, columna] */
export type Cell = [number, number];

export interface FilsWord {
  word: string;
  /** Recorregut de cel·les, en ordre de lectura. */
  path: Cell[];
}

export interface FilsPuzzle {
  /** Pista del tema que veu el jugador. */
  theme: string;
  /** Files de la graella (6 columnes × 8 files). */
  grid: string[];
  /** Paraula que travessa la graella d'un costat a l'altre. */
  spangram: FilsWord;
  words: FilsWord[];
}
