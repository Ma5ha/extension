import { ArrowUpRight, ArrowClockwise, Rss } from '@phosphor-icons/react';
import { useLocalValue } from '../local/useLocalValue';
import { useNews } from './useNews';
import { ArticleImage } from './ArticleImage';
import styles from '../App.module.css';
import css from './NewsPanel.module.css';
const parseImages = (raw: unknown) => raw === true;
export function NewsWidget({ openNews }: { openNews: () => void }) {
  const news = useNews();
  const images = useLocalValue('tabora.news.images', false, parseImages);
  const articles = [...new Map(news.feeds.flatMap(feed => feed.articles).map(article => [article.url, article])).values()].sort((a, b) => (b.date ?? 0) - (a.date ?? 0)).slice(0, 5);
  const updated = news.feeds.filter(feed => feed.updated > 0).map(feed => feed.updated);
  const failures = Object.values(news.failures).filter(Boolean);
  return <section className={styles.panel} aria-labelledby="rss-widget-title" aria-busy={!news.ready || !!news.loading.length}>
    <header className={styles.panelHeader}><h2 id="rss-widget-title"><Rss size={20} aria-hidden="true" />RSS news</h2><button aria-label="Refresh RSS headlines" title="Refresh headlines" disabled={!news.ready || !news.feeds.length || !!news.loading.length} onClick={() => { for (const feed of news.feeds) void news.refresh(feed); }}><ArrowClockwise size={16} aria-hidden="true" /></button></header>
    {!news.ready ? <p role="status">Loading saved headlines…</p> : !news.feeds.length ? <p className={css.empty}>Add RSS or Atom sources in News to see your latest headlines here.</p> : !articles.length ? <p className={css.empty}>{news.loading.length ? 'Loading headlines…' : 'No cached headlines yet. Refresh your sources in News.'}</p> : <ul className={`${css.articles} ${css.widgetArticles}`}>{articles.map(article => <li key={article.url}>
      {images.value && article.image && <ArticleImage key={article.image} url={article.image} />}
      <div><p className={css.meta}>{article.source}{article.date !== null && <> · <time dateTime={new Date(article.date).toISOString()}>{new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(article.date)}</time></>}</p><a href={article.url} target="_blank" rel="noreferrer">{article.title}<ArrowUpRight size={14} aria-hidden="true" /></a></div>
    </li>)}</ul>}
    {news.error && <p role="alert">{news.error}</p>}{!!failures.length && <p role="alert" className={styles.meta}>{failures[0]} Open News to manage source access.</p>}
    {news.loading.length > 0 && <p role="status" className={styles.meta}>Refreshing headlines…</p>}
    {!!updated.length && <p className={styles.meta}>Cached · Oldest source update {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(Math.min(...updated))}</p>}
    <button className={css.openNews} onClick={openNews}>{news.feeds.length ? 'Open all news' : 'Add sources'}<ArrowUpRight size={16} aria-hidden="true" /></button>
  </section>;
}
