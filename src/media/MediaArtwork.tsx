import { useState } from 'react';
import { SiteIcon } from '../components/SiteIcon';
import css from './MediaPanel.module.css';

export function MediaArtwork({ artwork, url, favicon, small = false }: { artwork?: string; url: string; favicon?: string; small?: boolean }) {
  const [failedURL, setFailedURL] = useState('');
  return <div className={small ? css.smallArtwork : css.artwork}>
    {artwork && artwork !== failedURL ? <img src={artwork} alt="" referrerPolicy="no-referrer" onError={() => setFailedURL(artwork)} /> : <span className={css.artworkFallback}><SiteIcon url={url} favIconUrl={favicon} size={small ? 24 : 48} /><span>No artwork available</span></span>}
    {!small && artwork && artwork !== failedURL && <span className={css.artworkBadge}><SiteIcon url={url} favIconUrl={favicon} size={16} /></span>}
  </div>;
}
