/** 0 = el més fàcil (groc) … 3 = el més difícil (lila). */
export type Level = 0 | 1 | 2 | 3;

export interface ConnexionsGroup {
  title: string;
  words: [string, string, string, string];
  level: Level;
}

export interface ConnexionsPuzzle {
  groups: [ConnexionsGroup, ConnexionsGroup, ConnexionsGroup, ConnexionsGroup];
}
