export const FONT_PAIRINGS = [
  {
    id: 'system',
    name: 'System Default',
    heading: 'ui-sans-serif, system-ui, sans-serif',
    body: 'ui-sans-serif, system-ui, sans-serif',
    href: ''
  },
  {
    id: 'editorial',
    name: 'Editorial Serif',
    heading: '"Playfair Display", Georgia, serif',
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
    href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&display=swap'
  },
  {
    id: 'modern',
    name: 'Modern Clean',
    heading: '"Fraunces", Georgia, serif',
    body: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    href: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=DM+Sans:wght@400;500;600&display=swap'
  },
  {
    id: 'soft',
    name: 'Soft Classic',
    heading: '"Cormorant Garamond", Georgia, serif',
    body: '"Jost", ui-sans-serif, system-ui, sans-serif',
    href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@400;500&display=swap'
  },
  {
    id: 'lora',
    name: 'Cozy Reader',
    heading: '"Lora", Georgia, serif',
    body: '"Source Sans 3", ui-sans-serif, system-ui, sans-serif',
    href: 'https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Source+Sans+3:wght@400;500;600&display=swap'
  }
];

export function applyFontPairing(id) {
  const p = FONT_PAIRINGS.find((f) => f.id === id) || FONT_PAIRINGS[0];
  const root = document.documentElement;
  root.style.setProperty('--font-heading', p.heading);
  root.style.setProperty('--font-body', p.body);
  root.style.setProperty('--font-display', p.heading);
  let link = document.getElementById('sh-google-fonts');
  if (p.href) {
    if (!link) {
      link = document.createElement('link');
      link.id = 'sh-google-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link.getAttribute('href') !== p.href) link.setAttribute('href', p.href);
  } else if (link) {
    link.remove();
  }
}