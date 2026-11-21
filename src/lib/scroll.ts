// Przewinięcie do elementu (płynnie przez Lenis, jeśli działa) + fokus na nim,
// żeby klawiatura i czytnik ekranu zaczynały od miejsca, które widać.
export function goTo(el: HTMLElement) {
  const lenis = (window as any).lenis;
  lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView();
  if (!el.matches('a, button, input, select, textarea, [tabindex]')) el.tabIndex = -1;
  el.focus({ preventScroll: true });
}
