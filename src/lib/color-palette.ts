export const COLOR_PALETTE = [
  ["blue", "Blau"], ["navy", "Blau marí"], ["sky", "Cel"], ["cyan", "Cian"],
  ["teal", "Turquesa"], ["green", "Verd"], ["emerald", "Maragda"], ["lime", "Llima"],
  ["yellow", "Groc"], ["amber", "Ambre"], ["orange", "Taronja"], ["coral", "Corall"],
  ["red", "Vermell"], ["rose", "Rosa"], ["pink", "Rosa viu"], ["fuchsia", "Fúcsia"],
  ["violet", "Violeta"], ["purple", "Lila"], ["indigo", "Indi"], ["slate", "Gris pissarra"],
  ["gray", "Gris"], ["brown", "Marró"],
] as const;

export type PaletteColor = (typeof COLOR_PALETTE)[number][0];

