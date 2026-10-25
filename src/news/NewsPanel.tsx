import { useState } from 'react';
import { ArrowUpRight, BookmarkSimple, Rss, Plus, ArrowClockwise, Trash } from '@phosphor-icons/react';
import { useLocalValue } from '../local/useLocalValue';
import { ArticleImage } from './ArticleImage';
import { useNews } from './useNews';
import styles from '../App.module.css';
import css from './NewsPanel.module.css';
const parseImages = (raw: unknown) => raw === true;
export function NewsPanel() {
  const images = useLocalValue('tabora.news.images', false, parseImages);
  const news = useNews();
  const [url, setUrl] = useState(''), [adding, setAdding] = useState(false), [filter, setFilter] = useState('all');
  const selected = filter === 'saved' ? news.saved : news.feeds.filter(f => filter === 'all' || f.id === filter).flatMap(f => f.articles);
  const articles = [...new Map(selected.map(a => [a.url, a])).values()].sort((a, b) => (b.date ?? 0) - (a.date ?? 0)).slice(0, filter === 'saved' ? 200 : 20);
  const date = (value: number) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(value);
  return <div className={css.news}>
    <section className={styles.panel} aria-labelledby="news-sources"><header className={styles.panelHeader}><h2 id="news-sources"><Rss size={22} aria-hidden="true" />Your sources</h2><button disabled={!news.ready || !!news.loading.length || !news.feeds.length} onClick={() => { for (const feed of news.feeds) void news.refresh(feed); }}><ArrowClockwise size={16} aria-hidden="true" />Refresh all</button></header>
      <p className={styles.meta}>Add an HTTPS RSS or Atom feed. Headlines stay in this browser. Updates are manual.</p>
      <form className={css.add} onSubmit={event => { event.preventDefault(); if (adding) return; setAdding(true); void news.add(url).then(ok => { if (ok) setUrl(''); }).finally(() => setAdding(false)); }}><label>Feed URL<input type="url" required placeholder="https://example.com/feed.xml" value={url} onChange={event => setUrl(event.target.value)} /></label><button type="submit" disabled={adding || !news.ready}><Plus size={16} aria-hidden="true" />{adding ? 'Adding…' : 'Add source'}</button></form>
      {news.error && <p role="alert">{news.error}</p>}
      {!news.ready ? <p role="status">Loading saved news…</p> : news.feeds.length === 0 ? <p className={css.empty}>No sources yet. Paste a feed address above to get started.</p> : <ul className={css.sources}>{news.feeds.map(feed => <li key={feed.id} aria-busy={news.loading.includes(feed.id)}><div><strong>{feed.title}</strong><small>{feed.url}</small><small>{news.loading.includes(feed.id) ? 'Refreshing…' : feed.updated ? `Cached · Updated ${date(feed.updated)}` : 'Not loaded yet'}</small>{news.failures[feed.id] && <p role="alert">{news.failures[feed.id]}</p>}</div><div className={css.actions}><button disabled={news.loading.includes(feed.id)} onClick={() => void news.refresh(feed, true)}>{news.failures[feed.id] ? 'Allow access & retry' : 'Refresh'}</button><button aria-label={`Remove source ${feed.title}`} title="Remove source; saved articles stay" onClick={() => { if (filter === feed.id) setFilter('all'); void news.remove(feed); }}><Trash size={16} aria-hidden="true" /></button></div></li>)}</ul>}
    </section>
    <section className={styles.panel} aria-labelledby="news-headlines"><header className={styles.panelHeader}><h2 id="news-headlines">{filter === 'saved' ? 'Saved articles' : 'Latest headlines'}</h2><label className={css.filter}>Show<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All sources</option><option value="saved">Saved articles ({news.saved.length})</option>{news.feeds.map(feed => <option key={feed.id} value={feed.id}>{feed.title}</option>)}</select></label></header>
      <label className={css.imageToggle}><input type="checkbox" checked={images.value} disabled={!images.ready} onChange={event => void images.save(event.target.checked)} />Show article images</label>
      <p className={styles.meta}>{images.value ? 'Images load from the feed’s image servers as you scroll. Refresh sources to find images in older cached headlines.' : 'Images are off. Enable them to load thumbnails supplied by your sources.'}</p>
      {images.error && <p role="alert">{images.error}</p>}
      <p className={styles.meta}>{filter === 'saved' ? 'Saved headlines and descriptions, available offline. Full articles open on the source website.' : 'Up to 20 headlines · Publication times use your local time zone'}</p>
      {articles.length === 0 ? <p className={css.empty}>{filter === 'saved' ? 'No saved articles yet. Use Save beside a headline.' : news.loading.length ? 'Loading headlines…' : 'No headlines to show. Add or refresh a source.'}</p> : <ul className={css.articles}>{articles.map(article => <li key={article.url}>{images.value && article.image && <ArticleImage key={article.image} url={article.image} />}<div><p className={css.meta}>{article.source}{article.date !== null && <> · <time dateTime={new Date(article.date).toISOString()}>{date(article.date)}</time></>}</p><a href={article.url} target="_blank" rel="noreferrer">{article.title}<ArrowUpRight size={15} aria-hidden="true" /></a>{article.summary && <p className={css.summary}>{article.summary}</p>}</div><button aria-pressed={news.saved.some(a => a.url === article.url)} aria-label={`${news.saved.some(a => a.url === article.url) ? 'Unsave' : 'Save'} article: ${article.title}`} onClick={() => void news.toggleSaved(article)}><BookmarkSimple size={18} weight={news.saved.some(a => a.url === article.url) ? 'fill' : 'regular'} aria-hidden="true" /><span>{news.saved.some(a => a.url === article.url) ? 'Saved' : 'Save'}</span></button></li>)}</ul>}
    </section>
  </div>;
}
