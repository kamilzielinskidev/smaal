// Odpowiedzi przykładowe — do weryfikacji z S-Maal.
export const faq = [
  {
    q: 'Ile kosztuje wykończenie mieszkania pod klucz na Śląsku?',
    a: 'Orientacyjnie od 900 do 2 250 zł brutto za m², zależnie od standardu materiałów i zakresu prac. Dokładny kosztorys przygotowujemy po bezpłatnej konsultacji. Sprzątanie po zakończeniu prac jest wliczone w cenę.',
  },
  {
    q: 'Ile trwa wykończenie mieszkania pod klucz?',
    a: 'Mieszkanie 60–90 m² realizujemy zwykle w 8–12 tygodni, dom 150–200 m² w 16–24 tygodnie. Harmonogram z kamieniami milowymi dostajesz przed podpisaniem umowy.',
  },
  {
    q: 'Jak dbacie o czystość podczas remontu?',
    a: 'Przed startem zabezpieczamy podłogi, okna, drzwi i klatkę schodową. Szlifujemy i tniemy z odciągiem pyłu, sprzątamy po każdym dniu pracy, a odpady wywozimy na bieżąco. Sprzątanie poremontowe z myciem okien, fug i podłóg jest w cenie.',
  },
  {
    q: 'Jak sprawdzacie dokładność prac?',
    a: 'Każdy etap odbieramy łatą 2 m i poziomicą laserową, zanim przejdziemy do następnego. Dopuszczamy odchyłkę do 2 mm na 2 m. Przy odbiorze dostajesz protokół z pomiarami i zdjęciami.',
  },
  {
    q: 'Czy pomagacie w wyborze materiałów?',
    a: 'Tak, doradzamy na każdym etapie: przy wyborze płytek, podłóg, drzwi, armatury i oświetlenia. Podpowiadamy, co sprawdzi się na co dzień i zmieści w budżecie.',
  },
  {
    q: 'Kto kupuje materiały wykończeniowe?',
    a: 'My. Zamawiamy, odbieramy i sprawdzamy materiały, korzystając z rabatów wykonawczych. Każdą pozycję widzisz w kosztorysie, a wybór zatwierdzasz przed zakupem.',
  },
  {
    q: 'Jaką gwarancję dajecie na prace?',
    a: 'Na wykonane prace udzielamy pisemnej gwarancji, a na materiały obowiązuje gwarancja producenta. Po odbiorze zostaje Ci protokół i dokumentacja zdjęciowa instalacji ukrytych w ścianach.',
  },
  {
    q: 'Na jakim obszarze działacie?',
    a: 'Siedzibę mamy w Mikołowie, realizujemy wykończenia na terenie całego województwa śląskiego, od Katowic, Gliwic i Tychów po Rybnik i Bielsko-Białą.',
  },
];

export const faqJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});
