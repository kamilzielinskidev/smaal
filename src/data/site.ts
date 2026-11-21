// Wszystkie dane kontaktowe to placeholdery konceptu — do podmiany na dane S-Maal.
export const site = {
  name: 'S-Maal',
  tagline: 'Wykończenia wnętrz pod klucz na Śląsku',
  description:
    'S-Maal — wykończenia mieszkań i domów pod klucz w standardzie premium. Siedziba w Mikołowie, realizacje na terenie całego Śląska. Umów bezpłatną konsultację.',
  street: 'ul. Przykładowa 1',
  postalCode: '43-190',
  city: 'Mikołów',
  region: 'śląskie',
  phone: '+48 000 000 000',
  email: 'kontakt@s-maal.pl',
  hours: 'pn–pt 8:00–17:00',
  geo: { lat: 50.17, lon: 18.904 },
};

export const nav = [
  { href: '/#realizacje', label: 'Realizacje' },
  { href: '/#uslugi', label: 'Usługi' },
  { href: '/#proces', label: 'Proces' },
  { href: '/#kalkulator', label: 'Kalkulator' },
  { href: '/#kontakt', label: 'Kontakt' },
];

// side: po której stronie kropki rysować etykietę na mapie
export const cities = [
  { name: 'Mikołów', slug: 'mikolow', lat: 50.17, lon: 18.904, side: 'left' },
  { name: 'Katowice', slug: 'katowice', lat: 50.264, lon: 19.024, side: 'right' },
  { name: 'Gliwice', slug: 'gliwice', lat: 50.294, lon: 18.672, side: 'left' },
  { name: 'Zabrze', slug: 'zabrze', lat: 50.325, lon: 18.786, side: 'left' },
  { name: 'Bytom', slug: 'bytom', lat: 50.348, lon: 18.916, side: 'right' },
  { name: 'Chorzów', slug: 'chorzow', lat: 50.297, lon: 18.954, side: 'left' },
  { name: 'Ruda Śląska', slug: 'ruda-slaska', lat: 50.256, lon: 18.856, side: 'left' },
  { name: 'Sosnowiec', slug: 'sosnowiec', lat: 50.286, lon: 19.104, side: 'right' },
  { name: 'Dąbrowa Górnicza', slug: 'dabrowa-gornicza', lat: 50.322, lon: 19.187, side: 'right' },
  { name: 'Tychy', slug: 'tychy', lat: 50.135, lon: 18.998, side: 'right' },
  { name: 'Rybnik', slug: 'rybnik', lat: 50.095, lon: 18.542, side: 'left' },
  { name: 'Żory', slug: 'zory', lat: 50.045, lon: 18.7, side: 'left' },
  { name: 'Jastrzębie-Zdrój', slug: 'jastrzebie-zdroj', lat: 49.957, lon: 18.592, side: 'left' },
  { name: 'Pszczyna', slug: 'pszczyna', lat: 49.979, lon: 18.954, side: 'right' },
  { name: 'Bielsko-Biała', slug: 'bielsko-biala', lat: 49.822, lon: 19.045, side: 'right' },
] as const;

export const businessJsonLd = (url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: site.name,
  description: site.description,
  url,
  telephone: site.phone,
  email: site.email,
  priceRange: '$$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.street,
    postalCode: site.postalCode,
    addressLocality: site.city,
    addressRegion: site.region,
    addressCountry: 'PL',
  },
  geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lon },
  areaServed: cities.map((c) => ({ '@type': 'City', name: c.name })),
});
