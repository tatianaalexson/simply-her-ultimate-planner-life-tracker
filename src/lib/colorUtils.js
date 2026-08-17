export function hexToHslChannels(hex) {
  let h = (hex || '').replace('#', '').trim();
  if (!h) return null;
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  let sat = 0;
  const light = (max + min) / 2;
  if (d !== 0) {
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      default: hue = (r - g) / d + 4;
    }
    hue /= 6;
  }
  return `${Math.round(hue * 360)} ${Math.round(sat * 100)}% ${Math.round(light * 100)}%`;
}

export function foregroundForChannels(channels) {
  const light = parseFloat((channels || '').split(' ')[2]);
  return !isNaN(light) && light > 58 ? '20 14% 14%' : '0 0% 98%';
}