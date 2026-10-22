export interface DocumentPlayerAPI {
  requestWindow(options: { width: number; height: number }): Promise<Window>;
}
export function documentPlayerAPI(): DocumentPlayerAPI | undefined {
  return (window as Window & { documentPictureInPicture?: DocumentPlayerAPI }).documentPictureInPicture;
}
// Only bundled styles and presentation attributes cross into the same-origin window.
export function preparePlayerWindow(popup: Window): () => void {
  const target = popup.document;
  target.title = 'Tabora · Mediji';
  const base = target.createElement('base');
  base.href = document.baseURI;
  target.head.append(base);
  document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style, link[rel="stylesheet"]').forEach(style => {
    const clone = style.cloneNode(true) as HTMLStyleElement | HTMLLinkElement;
    if (style instanceof HTMLLinkElement) (clone as HTMLLinkElement).href = style.href;
    target.head.append(clone);
  });
  const sync = () => {
    target.documentElement.lang = document.documentElement.lang;
    target.documentElement.dir = document.documentElement.dir;
    target.documentElement.dataset.theme = document.documentElement.dataset.theme || 'light';
    for (const property of ['--glass-opacity', '--material-blur']) target.documentElement.style.setProperty(property, document.documentElement.style.getPropertyValue(property));
    target.body.style.margin = '0';
    target.body.style.minWidth = '0';
  };
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang', 'dir', 'style'] });
  return () => observer.disconnect();
}
