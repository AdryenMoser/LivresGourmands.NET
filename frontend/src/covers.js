const COVERS = {
  'Marmite du dimanche': '/covers/marmite-du-dimanche.svg',
  'Quatre feux, une poêle': '/covers/quatre-feux.svg',
  'Le beurre et la manière': '/covers/beurre.svg',
  'Tartes sans détour': '/covers/tartes.svg',
  'Le geste juste': '/covers/geste.svg',
  'Sauces de saison': '/covers/sauces.svg',
  "Marchés d'ailleurs": '/covers/marches.svg',
  'Riz, feu et citron': '/covers/riz.svg',
  'Premier tablier': '/covers/tablier.svg',
  'Le couteau encore timide': '/covers/couteau.svg',
  'Bouillons clairs': '/covers/bouillons.svg',
  'Festins pour six': '/covers/festins.svg',
};

export function coverFor(titre) {
  return COVERS[titre] || '/covers/marmite-du-dimanche.svg';
}
