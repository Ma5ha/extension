import { useState } from 'react';
import css from './NewsPanel.module.css';
export function ArticleImage({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <img className={css.thumbnail} src={url} alt="" width={128} height={88} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
}
